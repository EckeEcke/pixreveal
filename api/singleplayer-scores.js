import { createClient } from "redis";

const ALLOWED_MODES = ["classic", "inspect", "gravity"];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mode } = req.query;

  if (mode && !ALLOWED_MODES.includes(mode)) {
    return res.status(400).json({ error: "Invalid mode" });
  }

  const client = createClient({
    url: process.env.KV_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    if (mode) {
      const key = `singleplayer:v1:${mode}`;
      const scores = await client.lRange(key, 0, -1);
      await client.disconnect();

      return res.status(200).json({
        mode,
        scores: scores.map(Number),
      });
    }

    const results = {};
    for (const m of ALLOWED_MODES) {
      const key = `singleplayer:v1:${m}`;
      const scores = await client.lRange(key, 0, -1);
      results[m] = scores.map(Number);
    }

    await client.disconnect();
    return res.status(200).json(results);
  } catch (error) {
    if (client.isOpen) {
      await client.disconnect();
    }

    return res.status(500).json({
      error: error.message,
    });
  }
}
