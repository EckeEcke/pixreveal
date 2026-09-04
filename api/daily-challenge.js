import { createClient } from "redis";

export default async function handler(req, res) {
  const client = createClient({
    url: process.env.KV_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  let targetDate = new Date().toISOString().split("T")[0];

  try {
    await client.connect();

    let data = await client.get(`daily:${targetDate}:set`);

    let rankingsRaw = await client.zRange(
      `daily:${targetDate}:rankings`,
      0,
      -1,
      { REV: true },
    );
    const winnersRaw = await client.lRange("daily:winners", 0, -1);

    if (!data) {
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      targetDate = yesterdayDate.toISOString().split("T")[0];

      const [fallbackData, fallbackRankings] = await Promise.all([
        client.get(`daily:${targetDate}:set`),
        client.zRange(`daily:${targetDate}:rankings`, 0, -1, { REV: true }),
      ]);

      data = fallbackData;
      rankingsRaw = fallbackRankings;
    }

    if (!data) {
      await client.disconnect();
      return res
        .status(404)
        .json({ error: "No data available", attempted: targetDate });
    }

    const parsedData = JSON.parse(data);
    const parsedRankings = rankingsRaw.map((r) => JSON.parse(r));
    const parsedYesterdayRankings = parsedData.yesterdayRankings ?? [];
    const parsedWinners = winnersRaw.map((w) => JSON.parse(w));

    await client.disconnect();

    return res.status(200).json({
      date: targetDate,
      rounds: parsedData.dailyRounds,
      mode: parsedData.mode,
      title: parsedData.curation?.heading,
      rankings: parsedRankings,
      winners: parsedWinners,
      yesterdayRankings: parsedYesterdayRankings,
    });
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({
      error: "Database error",
      details: error.message,
    });
  }
}
