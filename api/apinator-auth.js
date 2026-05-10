import crypto from "crypto";

const readJsonBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve(null);
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
  });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || (await readJsonBody(req));

    const socket_id = body?.socket_id;
    const channel_name = body?.channel_name;
    const username = decodeURIComponent(
      req.headers["x-player-username"] ||
        "Guest " + Math.floor(Math.random() * 1000),
    );
    const avatarIndex = req.headers["x-player-avatar"] || 0;
    const playerId = req.headers["x-player-id"] || "anon";
    const isHost = req.headers["x-player-host"] === "true";
    const rounds = req.headers["x-player-rounds"] || null;
    const duration = req.headers["x-player-duration"] || 15;

    const appKey = process.env.APINATOR_KEY || process.env.VITE_APINATOR_KEY;
    const appSecret = process.env.APINATOR_SECRET;

    const missing = [
      !appKey ? "APINATOR_KEY (or VITE_APINATOR_KEY)" : null,
      !appSecret ? "APINATOR_SECRET" : null,
    ].filter(Boolean);

    if (missing.length) {
      return res.status(500).json({
        error: "Missing server environment variables",
        missing,
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("apinator-auth request", {
        channel_name: String(channel_name),
        socket_id: String(socket_id),
        appKeyPrefix: String(appKey).slice(0, 8),
        secretLength: String(appSecret).length,
      });
    }

    if (!socket_id || !channel_name) {
      console.error("Auth payload missing fields", {
        hasBody: !!body,
        socket_id: !!socket_id,
        channel_name: !!channel_name,
      });
      return res.status(400).json({
        error: "Invalid auth payload",
        missing: [
          !socket_id ? "socket_id" : null,
          !channel_name ? "channel_name" : null,
        ].filter(Boolean),
      });
    }

    const channelDataString = JSON.stringify({
      user_id: String(playerId),
      user_info: {
        name: String(username),
        avatar: Number(avatarIndex),
        host: isHost,
        rounds,
        duration,
      },
    });

    const stringToSign = `${socket_id}:${channel_name}:${channelDataString}`;

    const hmac = crypto
      .createHmac("sha256", String(appSecret))
      .update(stringToSign)
      .digest("hex");

    res.status(200).json({
      auth: `${appKey}:${hmac}`,
      channel_data: channelDataString,
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
