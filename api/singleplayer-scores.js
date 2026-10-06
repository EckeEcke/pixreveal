import { createClient } from "redis";

const ALLOWED_MODES = ["classic", "inspect", "gravity"];

let client = null;

async function getClient() {
  if (!client) {
    client = createClient({ url: process.env.KV_REDIS_URL });
    client.on("error", (err) => console.log("Redis Client Error", err));
  }
  if (!client.isOpen) {
    await client.connect();
  }
  return client;
}

const fetchScores = async (redis, mode) =>
  (await redis.lRange(`singleplayer:v1:${mode}`, 0, -1)).map(Number);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mode } = req.query;

  if (mode && !ALLOWED_MODES.includes(mode)) {
    return res.status(400).json({ error: "Invalid mode" });
  }

  try {
    const redis = await getClient();

    let body;
    if (mode) {
      body = { mode, scores: await fetchScores(redis, mode) };
    } else {
      const entries = await Promise.all(
        ALLOWED_MODES.map(async (m) => [m, await fetchScores(redis, m)]),
      );
      body = Object.fromEntries(entries);
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}