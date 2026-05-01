import { createClient } from "redis";

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.KV_URL || process.env.REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    const today = new Date().toISOString().split("T")[0];
    const key = `daily:${today}:set`;

    const data = await client.get(key);

    if (!data) {
      await client.disconnect();
      return res
        .status(404)
        .json({ error: "Keine Daten für heute", date: today });
    }

    const parsedData = JSON.parse(data);

    await client.disconnect();
    return res.status(200).json(parsedData);
  } catch (error) {
    if (client.isOpen) await client.disconnect();

    return res.status(500).json({
      error: "Datenbank-Fehler",
      details: error.message,
    });
  }
}
