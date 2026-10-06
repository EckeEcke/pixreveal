import { createClient } from "redis";

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

const dateKey = (date) => date.toISOString().split("T")[0];

export default async function handler(req, res) {
  try {
    const redis = await getClient();

    let targetDate = dateKey(new Date());

    let [data, winnersRaw] = await Promise.all([
      redis.get(`daily:${targetDate}:set`),
      redis.lRange("daily:winners", 0, -1),
    ]);

    let rankingsRaw;

    if (data) {
      rankingsRaw = await redis.zRange(`daily:${targetDate}:rankings`, 0, -1, {
        REV: true,
      });
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      targetDate = dateKey(yesterday);

      [data, rankingsRaw] = await Promise.all([
        redis.get(`daily:${targetDate}:set`),
        redis.zRange(`daily:${targetDate}:rankings`, 0, -1, { REV: true }),
      ]);
    }

    if (!data) {
      return res
        .status(404)
        .json({ error: "No data available", attempted: targetDate });
    }

    const parsedData = JSON.parse(data);

    if (req.query.fresh) {
      res.setHeader("Cache-Control", "no-store");
    } else {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=30, stale-while-revalidate=60",
      );
    }

    return res.status(200).json({
      date: targetDate,
      rounds: parsedData.dailyRounds,
      mode: parsedData.mode,
      title: parsedData.curation?.heading,
      rankings: rankingsRaw.map((r) => JSON.parse(r)),
      winners: winnersRaw.map((w) => JSON.parse(w)),
      yesterdayRankings: parsedData.yesterdayRankings ?? [],
    });
  } catch (error) {
    return res.status(500).json({
      error: "Database error",
      details: error.message,
    });
  }
}