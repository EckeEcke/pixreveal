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
    const raw = localStorage.getItem(allowedIdsStorageKey(roomId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return new Set(parsed.filter((v) => typeof v === "string" && v));
  } catch {
    return null;
  }
};

export const writeAllowedIds = (roomId: string, ids: Set<string> | null) => {
  try {
    if (!ids) {
      localStorage.removeItem(allowedIdsStorageKey(roomId));
      return;
    }
    localStorage.setItem(allowedIdsStorageKey(roomId), JSON.stringify([...ids]));
  } catch {
  }
};

