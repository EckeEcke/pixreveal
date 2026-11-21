import { test } from "node:test";
import assert from "node:assert/strict";
import { createUserArtHandler, USER_ART_KEY, validateDrawings } from "../server/userArt.js";

const drawing = { name: "User drawing", category: "Gaming", primaryColor: 1, data: Array.from({ length: 16 }, () => Array(16).fill(1)) };
const revision = "a".repeat(40);
function setup({ source = [drawing], stored = null, upstreamOK = true } = {}) {
  let value = stored, fetches = 0, connections = 0, sets = 0, sourceURL;
  const handler = createUserArtHandler({
    env: { KV_REDIS_URL: "redis://test", UGC_SYNC_SECRET: "test-secret" },
    fetchImpl: async url => { fetches++; sourceURL = url; return { ok: upstreamOK, text: async () => JSON.stringify(source) }; },
    createClient: () => ({ isOpen: false, on() {}, async connect() { connections++; this.isOpen = true; }, async get(key) { assert.equal(key, USER_ART_KEY); return value; }, async set(key, snapshot, options) { assert.equal(key, USER_ART_KEY); assert.equal(options, undefined); sets++; value = snapshot; }, async disconnect() { this.isOpen = false; } }),
  });
  const call = async (method, { token = "Bearer test-secret", body = { revision } } = {}) => {
    const res = { headers: {}, statusCode: 200, setHeader(key, val) { this.headers[key] = val; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
    await handler({ method, headers: { authorization: token }, body }, res);
    return res;
  };
  return { call, value: () => value, fetches: () => fetches, connections: () => connections, sets: () => sets, sourceURL: () => sourceURL };
}
test("unauthorized synchronization cannot fetch or write data", async () => {
  const h = setup(); const result = await h.call("POST", { token: "Bearer wrong" });
  assert.equal(result.statusCode, 401); assert.equal(h.fetches(), 0); assert.equal(h.connections(), 0);
});
test("unsupported methods and malformed revisions are rejected", async () => {
  const h = setup(); assert.equal((await h.call("DELETE")).statusCode, 405);
  assert.equal((await h.call("POST", { body: { revision: "../other-repo" } })).statusCode, 400);
  assert.equal(h.fetches(), 0);
});
test("a valid collection is atomically published without an expiry", async () => {
  const h = setup(); const result = await h.call("POST");
  assert.equal(result.statusCode, 200); assert.equal(result.body.count, 1); assert.equal(h.sets(), 1);
  assert.equal(h.sourceURL(), "https://raw.githubusercontent.com/EckeEcke/pixreveal-ugc/" + revision + "/approved.json");
  const read = await h.call("GET"); assert.deepEqual(read.body, [drawing]);
  assert.equal(h.fetches(), 1); assert.match(read.headers["Cache-Control"], /s-maxage=60/);
});
test("normal reads never fetch GitHub and missing snapshots are not cached", async () => {
  const h = setup(); const result = await h.call("GET");
  assert.equal(result.statusCode, 503); assert.equal(result.headers["Cache-Control"], "no-store"); assert.equal(h.fetches(), 0);
});
test("invalid upstream data retains the last good snapshot", async () => {
  const stored = JSON.stringify({ drawings: [drawing], updatedAt: "2026-01-01" });
  const h = setup({ stored, source: [{ ...drawing, data: [[999]] }] });
  assert.equal((await h.call("POST")).statusCode, 502); assert.equal(h.value(), stored); assert.equal(h.sets(), 0);
  assert.deepEqual((await h.call("GET")).body, [drawing]);
});
test("upstream failures retain the previous snapshot", async () => {
  const h = setup({ stored: "previous", upstreamOK: false });
  assert.equal((await h.call("POST")).statusCode, 502); assert.equal(h.value(), "previous"); assert.equal(h.sets(), 0);
});
test("legacy superhero drawings are mapped to the current category", () => {
  assert.equal(validateDrawings([{ ...drawing, category: "Superheroes" }])[0].category, "Movies & TV");
});
test("unsupported palette indices, invalid names and categories are rejected", () => {
  for (const invalid of [{ ...drawing, name: " " }, { ...drawing, category: "Invalid" }, { ...drawing, primaryColor: 999 }]) {
    assert.throws(() => validateDrawings([invalid]));
  }
  assert.deepEqual(validateDrawings([]), []);
});
