import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { socket_id, channel_name } = req.body;
    const username = decodeURIComponent(
      req.headers["x-player-username"] || "Guest",
    );
    const avatarIndex = req.headers["x-player-avatar"] || 0;
    const playerId = req.headers["x-player-id"] || "anon";

    const appKey = process.env.VITE_APINATOR_KEY;
    const appSecret = process.env.APINATOR_SECRET;
    const channelDataString = JSON.stringify({
      user_id: String(playerId),
      user_info: {
        name: String(username),
        avatar: Number(avatarIndex),
      },
    });

    const stringToSign = `${socket_id}:${channel_name}:${channelDataString}`;

    const hmac = crypto
      .createHmac("sha256", appSecret)
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
