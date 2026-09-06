let accessToken = null;
let accessTokenExpiresAt = 0;

const getAccessToken = async () => {
  if (accessToken && Date.now() < accessTokenExpiresAt) return accessToken;

  const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  if (!tokenResponse.ok) throw new Error("Twitch authentication failed");

  const tokenData = await tokenResponse.json();
  accessToken = tokenData.access_token;
  accessTokenExpiresAt = Date.now() + (tokenData.expires_in - 60) * 1000;
  return accessToken;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    return res.status(503).json({ error: "Twitch API is not configured" });
  }

  const channelLogin = process.env.TWITCH_CHANNEL_LOGIN || "eckeeckeecke";

  try {
    const token = await getAccessToken();
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channelLogin)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Client-Id": process.env.TWITCH_CLIENT_ID,
        },
      },
    );

    if (!streamResponse.ok) {
      return res.status(502).json({ error: "Twitch stream lookup failed" });
    }

    const streamData = await streamResponse.json();
    res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({ live: streamData.data.length > 0 });
  } catch {
    return res.status(502).json({ error: "Twitch stream lookup failed" });
  }
}
