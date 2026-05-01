import { createClient } from "redis";

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.KV_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    const today = new Date().toISOString().split("T")[0];

    const [data, rankings] = await Promise.all([
      client.get(`daily:${today}:set`),
      client.lRange(`daily:${today}:rankings`, 0, -1),
    ]);

    if (!data) {
      await client.disconnect();
      return res.status(404).json({ error: "No data today", date: today });
    }

    const parsedData = JSON.parse(data);
    const parsedRankings = rankings.map((r) => JSON.parse(r));

    await client.disconnect();
    return res.status(200).json({
      date: today,
      rounds: parsedData.dailyRounds,
      mode: parsedData.mode,
      rankings: parsedRankings,
    });
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({
      error: "Database error",
      details: error.message,
    });
  }
}
