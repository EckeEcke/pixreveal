import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  const today = new Date().toISOString().split("T")[0];
  const key = `daily:${today}:set`;

  try {
    const data = await kv.get(key);

    if (!data) {
      return res.status(404).json({
        error: "No challenge found for today",
        date: today,
      });
    }

    const responseData = typeof data === "string" ? JSON.parse(data) : data;

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching daily challenge:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
