import { kv } from "@vercel/kv";
import drawings from "../src/data/drawings.json" with { type: "json" };

export default async function handler(req, res) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    const shuffled = [...drawings].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const dailyRounds = selected.map(drawing => {
      return {
        answer: drawing.name,
        data: drawing.data,
        options: generateOptions(drawing, drawings) 
      };
    });

    await kv.set(`daily:${today}:set`, JSON.stringify(dailyRounds));

    return res.status(200).json({ success: true, date: today });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}