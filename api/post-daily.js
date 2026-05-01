import { createClient } from "redis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, score, avatarIndex, date } = req.body;

  if (!name || score === undefined || avatarIndex === undefined || !date) {
    return res
      .status(400)
      .json({ error: "name, score, avatarIndex required" });
  }

  const client = createClient({
    url: process.env.KV_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    const key = `daily:${date}:rankings`;
    const entry = JSON.stringify({ name, score, avatarIndex, date });
    await client.lPush(key, entry);

    await client.disconnect();
    return res.status(200).json({ success: true });
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({ error: error.message });
  }
}
