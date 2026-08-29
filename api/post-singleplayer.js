import { createClient } from "redis";

const ALLOWED_MODES = ["classic", "inspect", "gravity"];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mode, score, revealTime, rounds } = req.body;

  if (!ALLOWED_MODES.includes(mode)) {
    return res.status(400).json({ error: "Invalid mode" });
  }

  if (score === undefined || revealTime === undefined || rounds === undefined) {
    return res.status(400).json({
      error: "score, revealTime and rounds required",
    });
  }

  const maxScore = Number(revealTime) * Number(rounds);
  const normalizedScore = Number(score) / maxScore;

  if (normalizedScore < 0 || normalizedScore > 1) {
    return res.status(400).json({
      error: "Invalid score",
    });
  }

  const client = createClient({
    url: process.env.KV_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    const key = `singleplayer:v1:${mode}`;

    await client.rPush(key, normalizedScore.toFixed(4));

    await client.disconnect();

    return res.status(200).json({ success: true });
  } catch (error) {
    if (client.isOpen) {
      await client.disconnect();
    }

    return res.status(500).json({
      error: error.message,
    });
  }
}
