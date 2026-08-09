import { ref, readonly } from "vue";

const GOOGLE_OAUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

function base64UrlEncode(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes[i];
    if (byte === undefined) continue;
    str += String.fromCharCode(byte);
  }
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest("SHA-256", data);
}

export function useYouTubeChat() {
  const accessToken = ref<string | null>(
    localStorage.getItem("yt_access_token"),
  );
  const refreshTokenValue = ref<string | null>(
    localStorage.getItem("yt_refresh_token"),
  );
  const expiresAt = ref<number | null>(
    localStorage.getItem("yt_expires_at")
      ? Number(localStorage.getItem("yt_expires_at"))
      : null,
  );

  async function initPKCE(
    clientId: string,
    clientSecret?: string,
    scope = "https://www.googleapis.com/auth/youtube.readonly",
  ) {
    const codeVerifier = crypto
      .getRandomValues(new Uint8Array(64))
      .reduce((s, b) => s + ("0" + b.toString(16)).slice(-2), "");
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64UrlEncode(hashed);

    localStorage.setItem("yt_code_verifier", codeVerifier);
    localStorage.setItem("yt_client_id", clientId);
    if (clientSecret) {
      localStorage.setItem("yt_client_secret", clientSecret);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: window.location.origin + window.location.pathname,
      response_type: "code",
      scope,
      include_granted_scopes: "true",
      access_type: "offline",
      prompt: "consent",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.href = `${GOOGLE_OAUTH_URL}?${params.toString()}`;
  }

  async function handleRedirect(clientId: string, clientSecret?: string) {
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");
    if (error) {
      const description = url.searchParams.get("error_description");
      console.error("YouTube OAuth redirect error", error, description);
      return false;
    }

    const code = url.searchParams.get("code");
    if (!code) return false;
    const codeVerifier = localStorage.getItem("yt_code_verifier");
    if (!codeVerifier) throw new Error("Missing code verifier");

    if (!clientId) {
      const stored = localStorage.getItem("yt_client_id");
      if (stored) clientId = stored;
    }
    if (!clientSecret) {
      const storedSecret = localStorage.getItem("yt_client_secret");
      if (storedSecret) clientSecret = storedSecret;
    }
    if (!clientId) throw new Error("Missing client id for token exchange");

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: window.location.origin + window.location.pathname,
    });

    if (clientSecret) {
      body.set("client_secret", clientSecret);
    }

    const resp = await fetch(TOKEN_URL, { method: "POST", body });
    const data = await resp.json();
    if (!resp.ok || !data.access_token) {
      // This is the #1 place PKCE flows silently die: Google Web-Application
      // OAuth clients require client_secret on token exchange even with PKCE.
      // If you see 400 invalid_client here, pass clientSecret into initPKCE/handleRedirect.
      console.error("YouTube token exchange failed", resp.status, data);
      return false;
    }
    accessToken.value = data.access_token;
    expiresAt.value = Date.now() + (data.expires_in || 3600) * 1000;
    if (data.refresh_token) {
      refreshTokenValue.value = data.refresh_token;
      localStorage.setItem("yt_refresh_token", data.refresh_token);
    }
    localStorage.setItem("yt_access_token", data.access_token);
    localStorage.setItem("yt_expires_at", String(expiresAt.value));
    url.searchParams.delete("code");
    window.history.replaceState({}, document.title, url.pathname);
    try {
      localStorage.removeItem("yt_code_verifier");
    } catch (e) {}
    try {
      localStorage.removeItem("yt_client_id");
    } catch (e) {}
    try {
      localStorage.removeItem("yt_client_secret");
    } catch (e) {}
    return true;
  }

  async function refreshToken(
    clientId: string,
    refreshToken: string,
    clientSecret?: string,
  ) {
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
    if (clientSecret) {
      body.set("client_secret", clientSecret);
    }
    const resp = await fetch(TOKEN_URL, { method: "POST", body });
    const data = await resp.json();
    if (resp.ok && data.access_token) {
      accessToken.value = data.access_token;
      expiresAt.value = Date.now() + (data.expires_in || 3600) * 1000;
      localStorage.setItem("yt_access_token", data.access_token);
      localStorage.setItem("yt_expires_at", String(expiresAt.value));
      return true;
    }
    console.warn("YouTube token refresh failed", resp.status, data);
    return false;
  }

  async function getAuthHeader() {
    const headers = new Headers();

    if (!accessToken.value && refreshTokenValue.value) {
      const refreshed = await refreshToken(
        localStorage.getItem("yt_client_id") || "",
        refreshTokenValue.value,
        localStorage.getItem("yt_client_secret") || undefined,
      );
      if (!refreshed) {
        console.warn(
          "YouTube refresh token failed; clearing stored auth state",
        );
        accessToken.value = null;
        expiresAt.value = null;
        localStorage.removeItem("yt_access_token");
        localStorage.removeItem("yt_expires_at");
        return headers;
      }
    }

    if (expiresAt.value && Date.now() > expiresAt.value) {
      if (refreshTokenValue.value) {
        const refreshed = await refreshToken(
          localStorage.getItem("yt_client_id") || "",
          refreshTokenValue.value,
          localStorage.getItem("yt_client_secret") || undefined,
        );
        if (!refreshed) {
          console.warn(
            "YouTube refresh token failed; clearing stored auth state",
          );
          accessToken.value = null;
          expiresAt.value = null;
          localStorage.removeItem("yt_access_token");
          localStorage.removeItem("yt_expires_at");
          return headers;
        }
      } else {
        accessToken.value = null;
        expiresAt.value = null;
        localStorage.removeItem("yt_access_token");
        localStorage.removeItem("yt_expires_at");
        return headers;
      }
    }

    if (!accessToken.value) return headers;
    headers.set("Authorization", `Bearer ${accessToken.value}`);
    return headers;
  }

  async function fetchLiveChatIdForChannel() {
    const headers = await getAuthHeader();
    if (!headers.get("Authorization")) {
      console.warn("No YouTube auth header available for liveChatId lookup");
      return null;
    }

    // broadcastStatus=active is unreliable: it's known to return an empty
    // list even when a broadcast is genuinely live (YouTube API quirk), and
    // it also excludes broadcasts still in "ready"/"testing". Fetch
    // broadcastStatus=all instead and filter client-side so we can see
    // exactly what state the broadcast is actually in.
    const url = `${YOUTUBE_API_BASE}/liveBroadcasts?part=snippet,status&broadcastStatus=all&broadcastType=all&mine=true&maxResults=25`;

    const resp = await fetch(url, { headers });
    const data = await resp.json();
    if (!resp.ok) {
      console.warn("YouTube liveBroadcasts API returned", resp.status, data);
      return null;
    }

    const items: any[] = data.items || [];
    if (!items.length) {
      console.warn(
        "No broadcasts at all found for authenticated channel. " +
          "Check that you're logged in with the account that owns the stream.",
      );
      return null;
    }

    // Log every broadcast's lifecycle status so it's obvious what's going on
    // (e.g. "ready" / "testing" / "live" / "complete").
    console.info(
      "YouTube broadcasts for this channel:",
      items.map((i) => ({
        title: i.snippet?.title,
        lifeCycleStatus: i.status?.lifeCycleStatus,
        liveChatId: i.snippet?.liveChatId,
      })),
    );

    const live = items.find((i) => i.status?.lifeCycleStatus === "live");
    if (live?.snippet?.liveChatId) {
      return live.snippet.liveChatId;
    }

    // Fallback: some accounts report "ready"/"testing" as the live chat
    // being already usable pre-broadcast (e.g. testing chat before going
    // live). Grab the most recent non-complete broadcast if nothing is
    // strictly "live" yet.
    const fallback = items.find(
      (i) =>
        i.status?.lifeCycleStatus &&
        !["complete", "revoked"].includes(i.status.lifeCycleStatus) &&
        i.snippet?.liveChatId,
    );
    if (fallback) {
      console.warn(
        `No broadcast with lifeCycleStatus "live" found; falling back to ` +
          `status "${fallback.status?.lifeCycleStatus}".`,
      );
      return fallback.snippet.liveChatId;
    }

    console.warn(
      "No active live broadcast found for authenticated channel",
      data,
    );
    return null;
  }

  let pollHandle: number | null = null;

  async function startPolling(
    liveChatId: string,
    onMessage: (msg: any) => void,
    onStatus?: (message: string) => void,
  ) {
    if (!liveChatId) throw new Error("liveChatId required");
    let pageToken: string | undefined;
    let interval = 5000;
    let retryDelay = 5000;
    let isActive = true;
    // Cap consecutive auth failures so we don't spin forever hammering
    // Google's endpoint if the refresh token itself is dead/revoked.
    let consecutiveAuthFailures = 0;
    const MAX_CONSECUTIVE_AUTH_FAILURES = 5;

    function scheduleRetry() {
      if (!isActive) return;
      pollHandle = window.setTimeout(poll, retryDelay);
      retryDelay = Math.min(60_000, retryDelay * 2);
    }

    async function poll() {
      if (!isActive) return;
      const params = new URLSearchParams({
        part: "snippet,authorDetails",
        liveChatId,
      });
      if (pageToken) params.set("pageToken", pageToken);
      const url = `${YOUTUBE_API_BASE}/liveChat/messages?${params.toString()}`;
      const headers = await getAuthHeader();

      if (!headers.get("Authorization")) {
        consecutiveAuthFailures++;
        if (consecutiveAuthFailures >= MAX_CONSECUTIVE_AUTH_FAILURES) {
          onStatus?.(
            "YouTube chat stopped: no valid auth token after several attempts. Please log in again.",
          );
          return; // give up for real, but only after repeated failures
        }
        onStatus?.(
          "YouTube chat is paused because no valid auth token is available. Retrying...",
        );
        scheduleRetry();
        return;
      }

      let resp: Response;
      try {
        resp = await fetch(url, { headers });
      } catch (e) {
        console.warn("YouTube chat poll network error", e);
        onStatus?.("YouTube chat network error; retrying.");
        scheduleRetry();
        return;
      }

      if (resp.status === 401) {
        console.warn("YouTube token expired or unauthorized");
        consecutiveAuthFailures++;
        // Force a fresh refresh attempt on the next poll instead of
        // permanently trusting a dead access token.
        accessToken.value = null;
        localStorage.removeItem("yt_access_token");
        localStorage.removeItem("yt_expires_at");
        if (consecutiveAuthFailures >= MAX_CONSECUTIVE_AUTH_FAILURES) {
          onStatus?.(
            "YouTube chat auth expired and could not be refreshed. Please log in again.",
          );
          return;
        }
        onStatus?.("YouTube chat auth expired; attempting to refresh.");
        scheduleRetry();
        return;
      }

      if (!resp.ok) {
        const retrySeconds = Math.min(60, Math.max(10, retryDelay / 1000));
        console.warn(
          `YouTube chat poll failed with ${resp.status}; retrying in ${retrySeconds}s`,
        );
        onStatus?.(
          `YouTube chat temporarily unavailable (${resp.status}); retrying in ${retrySeconds}s.`,
        );
        scheduleRetry();
        return;
      }

      // Successful response: reset failure counters/backoff.
      consecutiveAuthFailures = 0;
      retryDelay = 5000;

      const data = await resp.json().catch(() => null);
      if (data && data.items) {
        data.items.forEach((item: any) => onMessage(item));
      }
      if (data && typeof data.pollingIntervalMillis === "number") {
        interval = data.pollingIntervalMillis;
      }
      pageToken = data?.nextPageToken;
      if (isActive) {
        pollHandle = window.setTimeout(poll, interval);
      }
    }

    pollHandle = window.setTimeout(poll, 0);

    return () => {
      isActive = false;
      if (pollHandle) window.clearTimeout(pollHandle);
      pollHandle = null;
    };
  }

  function stopPolling() {
    if (pollHandle) window.clearTimeout(pollHandle);
    pollHandle = null;
  }

  return {
    accessToken: readonly(accessToken),
    expiresAt: readonly(expiresAt),
    initPKCE,
    handleRedirect,
    refreshToken,
    fetchLiveChatIdForChannel,
    startPolling,
    stopPolling,
  };
}

export default useYouTubeChat;
