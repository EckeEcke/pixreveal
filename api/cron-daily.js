import { createClient } from "redis";
import drawings from "../src/data/drawings.json" with { type: "json" };

function generateOptions(currentDrawing, allDrawings) {
  const correct = currentDrawing.name;
  const otherNames = allDrawings
    .map((d) => d.name)
    .filter((name) => name !== correct);

  const wrongOptions = [];
  while (wrongOptions.length < 3 && otherNames.length > 0) {
    const randomIndex = Math.floor(Math.random() * otherNames.length);
    wrongOptions.push(otherNames.splice(randomIndex, 1)[0]);
  }

  return [
    { title: correct, isCorrect: true },
    ...wrongOptions.map((name) => ({ title: name, isCorrect: false })),
  ].sort(() => Math.random() - 0.5);
}

export default async function handler(req, res) {
  if (req.headers["user-agent"] !== "vercel-cron/1.0") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = createClient({
    url: process.env.KV_REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    const today = new Date().toISOString().split("T")[0];

    const shuffled = [...drawings].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    const dailyRounds = selected.map((drawing) => {
      return {
        answer: drawing.name,
        data: drawing.data,
        options: generateOptions(drawing, drawings),
      };
    });

    const modes = ["classic", "inspect", "buzzer"];
    const mode = modes[Math.floor(Math.random() * modes.length)];

    await client.set(
      `daily:${today}:set`,
      JSON.stringify({ dailyRounds, mode }),
    );

    await client.disconnect();
    return res.status(200).json({ success: true, date: today });
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
}
