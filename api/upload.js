export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { name, category, data } = req.body;

  if (
    !name ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    name.length > 30
  ) {
    return res.status(400).json({ error: "Invalid name" });
  }

  if (!category || typeof category !== "string") {
    return res.status(400).json({ error: "Invalid category" });
  }

  if (!Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ error: "Invalid data" });
  }

  if (
    data.length !== 16 ||
    data.some((row) => !Array.isArray(row) || row.length !== 16)
  ) {
    return res.status(400).json({ error: "Grid must be 16x16" });
  }

  const flat = data.flat();

  const allNumbers = flat.every((p) => typeof p === "number");
  if (!allNumbers) {
    return res.status(400).json({ error: "Pixels must be numbers" });
  }

  const nonZeroCount = flat.filter((p) => p !== 0).length;
  if (nonZeroCount < 32) {
    return res.status(400).json({ error: "Not enough painted pixels" });
  }

  const counts = {};

  for (const pixel of flat) {
    if (pixel === 0) continue;
    counts[pixel] = (counts[pixel] || 0) + 1;
  }

  let primaryColor = null;
  let maxCount = 0;

  for (const color in counts) {
    if (counts[color] > maxCount) {
      maxCount = counts[color];
      primaryColor = Number(color);
    }
  }

  if (primaryColor === null) {
    return res.status(400).json({ error: "No valid primary color found" });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.json`;

  const payload = {
    name: name.trim(),
    category: category.trim(),
    primaryColor,
    data,
    createdAt: Date.now(),
  };

  const content = Buffer.from(JSON.stringify(payload)).toString("base64");

  const url = `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/ugc/pending/${fileName}`;

  const ghRes = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `UGC upload ${fileName}`,
      content,
    }),
  });

  const result = await ghRes.json();

  if (!ghRes.ok) {
    return res.status(500).json(result);
  }

  return res.status(200).json({ success: true });
}
