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
      username: String(body.username || "Player").slice(0, 32),
      avatarIndex: Math.max(0, Number(body.avatarIndex) || 0),
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
        username: String(req.body?.username || "Player").slice(0, 32),
        avatarIndex: Math.max(0, Number(req.body?.avatarIndex) || 0),
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
