import { createClient } from "redis";
import drawings from "../src/data/drawings.json" with { type: "json" };
import colorPalette from "../src/data/colorPalette";

// Fix im Code hinterlegt, 1:1 aus dem Frontend übernommen (Namen sind das, was zählt —
// color/icon werden hier nicht gebraucht, aber der Vollständigkeit halber mitgeführt).
const CATEGORIES = [
  {
    name: "Animals & Nature",
    color: "var(--neon-success)",
    icon: "🌿",
  },
  { name: "Objects & People", color: "var(--neon-blue)", icon: "📦" },
  { name: "Food", color: "var(--primary)", icon: "🍕" },
  { name: "Gaming", color: "var(--neon-pink)", icon: "🎮" },
  { name: "Anime & Cartoons", color: "var(--neon-yellow)", icon: "📺" },
  {
    name: "Movies & TV",
    color: "var(--neon-purple)",
    icon: "🎬",
  },
];

const RECENT_DAYS_TO_TRACK = 13; // + heute = 14 Tage Historie, um Wiederholungen zu vermeiden

// 0 = Sonntag ... 6 = Samstag. Kein "random"/"theme" mehr, nur noch Farbe und
// Kategorie im Wechsel.
const DAY_THEMES = {
  0: "color", // Sonntag
  1: "category", // Montag
  2: "color", // Dienstag
  3: "category", // Mittwoch
  4: "color", // Donnerstag
  5: "category", // Freitag
  6: "color", // Samstag
};

function dedupeByName(arr) {
  const seen = new Set();
  const result = [];
  for (const item of arr) {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      result.push(item);
    }
  }
  return result;
}

// --- Farbgruppen ------------------------------------------------------
//
// Statt exakter Hex-Gleichheit (die bei 26 Paletten-Farben oft nur 1-2 Motive
// pro Farbe liefern würde) werden ähnliche Farbtöne zu groben, intuitiven
// Gruppen zusammengefasst (Rot, Orange, Braun, Gelb, Grün, Cyan, Blau, Lila,
// Pink, Schwarz, Weiß, Grau). Basis ist eine simple HSL-Bucket-Heuristik,
// kein Anspruch auf exakte Farbwissenschaft — bei Bedarf lassen sich einzelne
// Paletten-Indizes unten in COLOR_GROUP_OVERRIDES manuell umsortieren.

function hexToHsl(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
      break;
    case g:
      h = ((b - r) / d + 2) * 60;
      break;
    default:
      h = ((r - g) / d + 4) * 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function getColorGroup(hex) {
  if (!hex || !hex.startsWith("#")) return null; // z.B. "transparent"

  const { h, s, l } = hexToHsl(hex);

  if (l <= 12) return "Black";
  if (l >= 92 && s <= 10) return "White";
  if (s <= 12) return "Gray";

  // Dunkle/gedeckte warme Töne wirken eher "braun" als "rot/orange".
  if ((h < 50 || h >= 345) && l < 45 && s > 20) return "Brown";

  if (h < 15 || h >= 345) return "Red";
  if (h < 45) return "Orange";
  if (h < 70) return "Yellow";
  if (h < 170) return "Green";
  if (h < 200) return "Cyan";
  if (h < 260) return "Blue";
  if (h < 290) return "Purple";
  return "Pink";
}

// Manuelle Korrekturen für Paletten-Indizes, bei denen die automatische
// Heuristik danebenliegt (Index aus colorPalette.ts -> Gruppenname).
const COLOR_GROUP_OVERRIDES = {
  // 20: "Brown", // Beispiel: falls "#CA895D" lieber als Braun statt Orange gelten soll
};

// Paletten-Index -> Gruppenname, einmal beim Modul-Load berechnet.
const COLOR_GROUP_BY_INDEX = Object.fromEntries(
  Object.entries(colorPalette).map(([index, hex]) => [
    index,
    COLOR_GROUP_OVERRIDES[index] ?? getColorGroup(hex),
  ]),
);

function colorGroupOf(primaryColorIndex) {
  return COLOR_GROUP_BY_INDEX[primaryColorIndex] ?? null;
}

// Stabile Liste aller vorkommenden Farbgruppen — bewusst aus dem unveränderten
// `drawings`-Import gebaut (nicht aus der pro Request geshuffelten `uniqueDrawings`-
// Liste), damit die Rotation über Cron-Läufe hinweg wirklich der Reihe nach
// durchzählt statt bei jedem Lauf in zufälliger Reihenfolge zu landen. `null`
// (z.B. durch primaryColor "transparent") wird ausgeschlossen — ein echtes Motiv
// sollte ohnehin nie eine transparente Primärfarbe haben.
const ALL_COLOR_GROUPS = [
  ...new Set(drawings.map((d) => colorGroupOf(d.primaryColor)).filter(Boolean)),
].sort();

// Kategorien sind fix im Code definiert (nicht aus den Motiven abgeleitet) — die
// Rotation läuft also über die vollständige, feste Kategorienliste, auch wenn
// gerade nicht zu jeder Kategorie Motive vorhanden sind (dann greift weiter unten
// der Pool-zu-klein-Fallback auf "Random").
const ALL_CATEGORIES = CATEGORIES.map((c) => c.name);

// --- Distraktoren -------------------------------------------------------

// Wählt 3 Falsch-Antworten, die möglichst nah am richtigen Motiv liegen (gleiche
// Kategorie + gleiche Farbgruppe > gleiche Kategorie > gleiche Farbgruppe > Rest).
function generateOptions(currentDrawing, allDrawings) {
  const correct = currentDrawing.name;
  const others = allDrawings.filter((d) => d.name !== correct);
  const correctGroup = colorGroupOf(currentDrawing.primaryColor);

  const sameCategoryAndColor = others.filter(
    (d) => d.category === currentDrawing.category && colorGroupOf(d.primaryColor) === correctGroup,
  );
  const sameCategory = others.filter((d) => d.category === currentDrawing.category);
  const sameColor = others.filter((d) => colorGroupOf(d.primaryColor) === correctGroup);

  const wrongOptions = [];
  const usedNames = new Set();

  function pickFrom(pool, target) {
    const candidates = pool.filter((d) => !usedNames.has(d.name));
    while (wrongOptions.length < target && candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      const [picked] = candidates.splice(idx, 1);
      usedNames.add(picked.name);
      wrongOptions.push(picked.name);
    }
  }

  pickFrom(sameCategoryAndColor, 3);
  pickFrom(sameCategory, 3);
  pickFrom(sameColor, 3);
  pickFrom(others, 3);

  return [
    { title: correct, isCorrect: true },
    ...wrongOptions.map((name) => ({ title: name, isCorrect: false })),
  ].sort(() => Math.random() - 0.5);
}

// --- Tages-Set-Auswahl ----------------------------------------------------

// Rotiert deterministisch, aber persistent über Cron-Läufe hinweg, durch eine
// Werteliste, damit nicht jeden zweiten Tag dieselbe Farbgruppe / Kategorie
// drankommt.
async function getRotatingValue(client, key, values) {
  if (values.length === 0) return null;
  const idx = await client.incr(key);
  return values[(idx - 1) % values.length];
}

async function getRecentlyUsedNames(client) {
  const raw = await client.lRange("daily:recent-sets", 0, RECENT_DAYS_TO_TRACK - 1);
  const names = new Set();
  for (const entry of raw) {
    try {
      const { names: entryNames } = JSON.parse(entry);
      entryNames.forEach((n) => names.add(n));
    } catch {
      // beschädigte Einträge ignorieren
    }
  }
  return [...names];
}

async function rememberUsedNames(client, today, names) {
  await client.lPush("daily:recent-sets", JSON.stringify({ date: today, names }));
  await client.lTrim("daily:recent-sets", 0, RECENT_DAYS_TO_TRACK);
}

// Wählt 5 Motive aus dem (bereits nach Farbe/Kategorie gefilterten) Pool,
// bevorzugt Motive, die nicht in den letzten RECENT_DAYS_TO_TRACK Tagen schon
// dran waren, und füllt bei Bedarf aus dem restlichen Pool auf.
function pickDailySet(pool, recentNames) {
  const recentSet = new Set(recentNames);
  const fresh = pool.filter((d) => !recentSet.has(d.name));
  const stale = pool.filter((d) => recentSet.has(d.name));

  const selected = [];
  const usedNames = new Set();

  function pickFrom(source, target) {
    const candidates = source.filter((d) => !usedNames.has(d.name));
    while (selected.length < target && candidates.length > 0) {
      const idx = Math.floor(Math.random() * candidates.length);
      const [picked] = candidates.splice(idx, 1);
      usedNames.add(picked.name);
      selected.push(picked);
    }
  }

  pickFrom(fresh, 5);
  pickFrom(stale, 5);

  return selected;
}

export default async function handler(req, res) {
  if (req.headers["user-agent"] !== "vercel-cron/1.0") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = createClient({ url: process.env.KV_REDIS_URL });
  client.on("error", (err) => console.log("Redis Client Error", err));

  try {
    await client.connect();

    const today = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 864e5).toISOString().split("T")[0];
    const weekday = new Date(`${today}T00:00:00Z`).getUTCDay(); // 0 = Sonntag

    const yesterdayRankingsRaw = await client.zRange(`daily:${yesterdayStr}:rankings`, 0, -1, {
      REV: true,
    });
    const yesterdayRankings = yesterdayRankingsRaw.map((r) => JSON.parse(r));

    if (yesterdayRankings.length > 0) {
      const yesterdayWinner = yesterdayRankings[0];
      await client.lPush(
        "daily:winners",
        JSON.stringify({ date: yesterdayStr, winner: yesterdayWinner }),
      );
    }

    const shuffled = [...drawings].sort(() => 0.5 - Math.random());
    const uniqueDrawings = dedupeByName(shuffled);

    const dayType = DAY_THEMES[weekday];
    const recentNames = await getRecentlyUsedNames(client);

    let pool = uniqueDrawings;
    let targetLabel = null;
    let effectiveType = dayType;

    if (dayType === "color") {
      const targetGroup = await getRotatingValue(client, "rotation:color", ALL_COLOR_GROUPS);
      pool = uniqueDrawings.filter((d) => colorGroupOf(d.primaryColor) === targetGroup);
      targetLabel = targetGroup;
    } else {
      const targetCategory = await getRotatingValue(client, "rotation:category", ALL_CATEGORIES);
      pool = uniqueDrawings.filter((d) => d.category === targetCategory);
      targetLabel = targetCategory;
    }

    if (pool.length < 5) {
      console.log(`Pool zu klein für ${dayType} (${targetLabel}), Fallback auf Zufallsauswahl`);
      pool = uniqueDrawings;
      targetLabel = null;
      effectiveType = "random";
    }

    const selected = pickDailySet(pool, recentNames);
    const heading =
      effectiveType === "color"
        ? `Color ${targetLabel}`
        : effectiveType === "category"
          ? targetLabel
          : "Random";

    const dailyRounds = selected.map((drawing) => ({
      answer: drawing.name,
      data: drawing.data,
      options: generateOptions(drawing, uniqueDrawings),
    }));

    const modes = ["classic", "inspect", "gravity"];
    const mode = modes[Math.floor(Math.random() * modes.length)];

    const curation = { type: effectiveType, target: targetLabel, heading };

    await client.set(
      `daily:${today}:set`,
      JSON.stringify({ dailyRounds, mode, yesterdayRankings, curation }),
      { EX: 60 * 60 * 24 * 3 },
    );

    await client.expire(`daily:${today}:rankings`, 60 * 60 * 24 * 3);
    await rememberUsedNames(
      client,
      today,
      selected.map((d) => d.name),
    );

    await client.disconnect();
    return res.status(200).json({ success: true, date: today, curation });
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
}