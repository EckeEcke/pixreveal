import { createClient } from "redis";

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.KV_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    const today = new Date().toISOString().split("T")[0];
    const key = `daily:${today}:set`;

    const data = await client.get(key);

    if (!data) {
      await client.disconnect();
      return res.status(404).json({ error: "No data today", date: today });
    }

    await client.disconnect();
    return res.status(200).json({ date: today, rounds: JSON.parse(data) });
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({
      error: "Database error",
      details: error.message,
    });
  }
}
