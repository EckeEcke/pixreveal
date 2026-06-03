export type PersistedSession<TUserData = any> = {
  roomId: string;
  userData: TUserData;
  mode: "regular" | "party";
  wasInGame: boolean;
  lastRole: "host" | "player";
};

export const LAST_SESSION_KEY = "pixreveal:lastSession";
export const ALLOWED_IDS_PREFIX = "pixreveal:allowedIds:";

export const readPersistedSession = <TUserData = any>(): PersistedSession<TUserData> | null => {
  try {
    const raw = sessionStorage.getItem(LAST_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSession<TUserData>;
    if (!parsed?.roomId || !(parsed as any)?.userData?.playerId) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writePersistedSession = <TUserData = any>(
  session: PersistedSession<TUserData> | null,
) => {
  try {
    if (!session) {
      sessionStorage.removeItem(LAST_SESSION_KEY);
      return;
    }
    sessionStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage failures
  }
};

const allowedIdsStorageKey = (roomId: string) => `${ALLOWED_IDS_PREFIX}${roomId}`;

export const readAllowedIds = (roomId: string): Set<string> | null => {
  try {
    const key = allowedIdsStorageKey(roomId);

    const raw = sessionStorage.getItem(key) ?? localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const ids = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.ids)
        ? parsed.ids
        : null;

    if (!ids) return null;

    // If it came from localStorage (old behavior), migrate to sessionStorage once.
    if (!sessionStorage.getItem(key) && localStorage.getItem(key)) {
      try {
        sessionStorage.setItem(key, JSON.stringify(ids));
        localStorage.removeItem(key);
      } catch {
      }
    }

    return new Set(ids.filter((v: unknown) => typeof v === "string" && v));
  } catch {
    return null;
  }
};

export const writeAllowedIds = (roomId: string, ids: Set<string> | null) => {
  try {
    const key = allowedIdsStorageKey(roomId);
    if (!ids) {
      sessionStorage.removeItem(key);
      localStorage.removeItem(key); // cleanup legacy location
      return;
    }

    sessionStorage.setItem(key, JSON.stringify([...ids]));
    localStorage.removeItem(key); // cleanup legacy location
  } catch {
  }
};
