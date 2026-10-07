import { createClient } from "redis";

const ALLOWED_MODES = ["classic", "inspect", "gravity"];
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const redisKey = (sessionId) => `challenge:v1:${sessionId}`;

const isValidSessionId = (value) =>
  typeof value === "string" && /^[A-Za-z0-9]{6}$/.test(value);

const createSessionId = () =>
  Array.from({ length: 6 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"[
      Math.floor(Math.random() * 56)
    ],
  ).join("");

const cleanSession = (body) => {
  const mode = String(body.mode || "");
  const rounds = Array.isArray(body.rounds) ? body.rounds.slice(0, 50) : [];
  const answers = Array.isArray(body.answerHistory)
    ? body.answerHistory.slice(0, rounds.length).map(Boolean)
    : [];

  if (!ALLOWED_MODES.includes(mode) || rounds.length === 0) return null;

  return {
    sessionId: "",
    mode,
    revealTime: Math.max(1, Math.min(60, Number(body.revealTime) || 15)),
    rounds,
    challenger: {
      playerId: String(body.playerId || "").slice(0, 80),
      username: String(body.username || "Player").slice(0, 32),
      avatarIndex: Math.max(0, Number(body.avatarIndex) || 0),
      avatarSpriteSheet: body.avatarSpriteSheet === "unlockables" ? "unlockables" : "classic",
      score: Number(body.score) || 0,
      answerHistory: answers,
    },
    opponent: null,
    createdAt: Date.now(),
  };
};

const connectRedis = () => {
  const client = createClient({ url: process.env.KV_REDIS_URL });
  client.on("error", (err) => console.log("Redis Client Error", err));
  return client;
};

export default async function handler(req, res) {
  const client = connectRedis();

  try {
    await client.connect();

    // 1. Batch-Status-Check für mehrere Session-IDs (Inkl. Sieg/Niederlage/Unentschieden-Auswertung)
    if (req.method === "POST" && Array.isArray(req.body?.sessionIds)) {
      const sessionIds = req.body.sessionIds.filter(isValidSessionId);
      const results = {};

      if (sessionIds.length > 0) {
        const keys = sessionIds.map(redisKey);
        const rawValues = await client.mGet(keys);

        sessionIds.forEach((id, index) => {
          const raw = rawValues[index];
          if (raw) {
            try {
              const session = JSON.parse(raw);
              const hasOpponent = Boolean(session.opponent);
              let won = false;
              let draw = false;

              if (hasOpponent) {
                const challengerScore = session.challenger?.score || 0;
                const opponentScore = session.opponent?.score || 0;

                if (challengerScore > opponentScore) {
                  won = true;
                } else if (challengerScore === opponentScore) {
                  draw = true;
                } else {
                  won = false;
                }
              }

              results[id] = {
                hasOpponent,
                won,
                draw,
              };
            } catch {
              results[id] = { hasOpponent: false, won: false, draw: false };
            }
          } else {
            results[id] = { hasOpponent: false, won: false, draw: false };
          }
        });
      }

      await client.disconnect();
      return res.status(200).json(results);
    }

    // 2. Bestehend: Einzelne Challenge erstellen (POST)
    if (req.method === "POST") {
      const session = cleanSession(req.body || {});
      if (!session) {
        await client.disconnect();
        return res.status(400).json({ error: "Invalid challenge session" });
      }

      let stored = false;
      for (let attempt = 0; attempt < 5 && !stored; attempt += 1) {
        session.sessionId = createSessionId();
        stored = Boolean(
          await client.set(redisKey(session.sessionId), JSON.stringify(session), {
            EX: SESSION_TTL_SECONDS,
            NX: true,
          }),
        );
      }

      if (!stored) {
        await client.disconnect();
        return res.status(503).json({ error: "Could not create challenge" });
      }
      await client.disconnect();
      return res.status(201).json({ sessionId: session.sessionId });
    }

    // 3. Abrufen oder Patchen einer einzelnen Challenge (GET / PATCH)
    const sessionId = req.query?.sessionId;
    if (!isValidSessionId(sessionId)) {
      await client.disconnect();
      return res.status(400).json({ error: "Valid sessionId required" });
    }

    const key = redisKey(sessionId);
    const raw = await client.get(key);
    if (!raw) {
      await client.disconnect();
      return res.status(404).json({ error: "Challenge not found or expired" });
    }

    const session = JSON.parse(raw);

    if (req.method === "PATCH") {
      if (session.opponent) {
        await client.disconnect();
        return res.status(409).json({ error: "Challenge already accepted" });
      }

      const answerHistory = Array.isArray(req.body?.answerHistory)
        ? req.body.answerHistory
            .slice(0, session.rounds.length)
            .map(Boolean)
        : [];

      session.opponent = {
        playerId: String(req.body?.playerId || "").slice(0, 80),
        username: String(req.body?.username || "Player").slice(0, 32),
        avatarIndex: Math.max(0, Number(req.body?.avatarIndex) || 0),
        avatarSpriteSheet: req.body?.avatarSpriteSheet === "unlockables" ? "unlockables" : "classic",
        score: Number(req.body?.score) || 0,
        answerHistory,
      };

      await client.setEx(key, SESSION_TTL_SECONDS, JSON.stringify(session));
      await client.disconnect();
      return res.status(200).json(session);
    }

    await client.disconnect();
    return res.status(200).json(session);
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({ error: error.message });
  }
}