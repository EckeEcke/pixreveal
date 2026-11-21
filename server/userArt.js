import { timingSafeEqual } from "node:crypto";
import colorPalette from "../src/data/colorPalette.js";

export const USER_ART_KEY = "ugc:v1:approved";
const SOURCE_ROOT = "https://raw.githubusercontent.com/EckeEcke/pixreveal-ugc";
const CATEGORIES = new Set(["Animals & Nature", "Objects & People", "Food", "Gaming", "Anime & Cartoons", "Movies & TV"]);

export function validateDrawings(value) {
  if (!Array.isArray(value) || value.length > 10000) throw new Error("Expected a drawing collection");
  return value.map((drawing) => {
    const category = drawing?.category === "Superheroes" ? "Movies & TV" : drawing?.category;
    if (typeof drawing?.name !== "string" || !drawing.name.trim() || drawing.name.length > 100 ||
        !CATEGORIES.has(category) || !Number.isInteger(drawing.primaryColor) ||
        !Object.hasOwn(colorPalette, drawing.primaryColor) ||
        !Array.isArray(drawing.data) || drawing.data.length !== 16 ||
        drawing.data.some(row => !Array.isArray(row) || row.length !== 16 ||
          row.some(pixel => !Number.isInteger(pixel) || !Object.hasOwn(colorPalette, pixel)))) {
      throw new Error("Invalid approved drawing");
    }
    return { name: drawing.name.trim(), category, primaryColor: drawing.primaryColor, data: drawing.data };
  });
}

function authorized(header, secret) {
  if (!secret || typeof header !== "string") return false;
  const received = Buffer.from(header);
  const expected = Buffer.from("Bearer " + secret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function createUserArtHandler({ createClient, fetchImpl = fetch, env = process.env }) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    let snapshot;
    if (req.method === "POST") {
      if (!env.UGC_SYNC_SECRET) return res.status(503).json({ error: "User art sync is not configured" });
      if (!authorized(req.headers?.authorization, env.UGC_SYNC_SECRET)) return res.status(401).json({ error: "Unauthorized" });
      let revision;
      try {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        revision = body?.revision;
        if (revision !== undefined && (typeof revision !== "string" || !/^[a-f0-9]{40}$/.test(revision))) throw new Error();
      } catch {
        return res.status(400).json({ error: "Invalid source revision" });
      }
      try {
        const response = await fetchImpl(SOURCE_ROOT + "/" + (revision || "main") + "/approved.json", {
          signal: AbortSignal.timeout(15000),
          headers: { Accept: "application/json", "Cache-Control": "no-cache" },
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Source unavailable");
        const raw = await response.text();
        if (Buffer.byteLength(raw) > 5 * 1024 * 1024) throw new Error("Source too large");
        snapshot = { revision: revision || null, updatedAt: new Date().toISOString(), drawings: validateDrawings(JSON.parse(raw)) };
      } catch (error) {
        console.error("User art source validation failed:", error.message);
        return res.status(502).json({ error: "Could not fetch a valid approved collection; previous snapshot retained" });
      }
    }
    if (!env.KV_REDIS_URL) return res.status(503).json({ error: "User art storage is not configured" });
    const client = createClient({ url: env.KV_REDIS_URL });
    client.on("error", (error) => console.error("User art Redis error:", error.message));
    try {
      await client.connect();
      if (req.method === "POST") {
        // A single SET replaces the entire collection atomically, with no expiry.
        await client.set(USER_ART_KEY, JSON.stringify(snapshot));
        return res.status(200).json({ success: true, count: snapshot.drawings.length, updatedAt: snapshot.updatedAt, revision: snapshot.revision });
      }
      const raw = await client.get(USER_ART_KEY);
      if (!raw) return res.status(503).json({ error: "User art has not been synchronized yet" });
      const stored = JSON.parse(raw);
      res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=60");
      res.setHeader("X-User-Art-Updated-At", stored.updatedAt);
      return res.status(200).json(stored.drawings);
    } catch (error) {
      console.error("User art storage failed:", error.message);
      return res.status(503).json({ error: "User art is temporarily unavailable" });
    } finally {
      if (client.isOpen) {
        try { await client.disconnect(); } catch { /* Response has already been prepared. */ }
      }
    }
  };
}
