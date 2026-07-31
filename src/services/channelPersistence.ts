export type BaseUserData = {
  playerId: string;
};

export type PersistedSession<TUserData extends BaseUserData = BaseUserData> = {
  roomId: string;
  userData: TUserData;
  mode: "regular" | "party";
  wasInGame: boolean;
  lastRole: "host" | "player";
};

export const LAST_SESSION_KEY = "pixreveal:lastSession";
export const ALLOWED_IDS_STORAGE_KEY = "pixreveal:allowedIds";

type StoredAllowedIds = Record<string, string>;

/**
 * Type Guard zur sicheren Laufzeit-Validierung des PersistedSession-Objekts.
 */
function isPersistedSession<TUserData extends BaseUserData>(
  obj: unknown,
): obj is PersistedSession<TUserData> {
  if (!obj || typeof obj !== "object") return false;

  const candidate = obj as Record<string, unknown>;

  const hasRoomId =
    typeof candidate.roomId === "string" && candidate.roomId.length > 0;
  const hasValidMode =
    candidate.mode === "regular" || candidate.mode === "party";
  const hasValidRole =
    candidate.lastRole === "host" || candidate.lastRole === "player";
  const hasWasInGame = typeof candidate.wasInGame === "boolean";

  const userData = candidate.userData as Record<string, unknown> | undefined;
  const hasPlayerId =
    typeof userData?.playerId === "string" && userData.playerId.length > 0;

  return (
    hasRoomId && hasValidMode && hasValidRole && hasWasInGame && hasPlayerId
  );
}

export const readPersistedSession = <
  TUserData extends BaseUserData = BaseUserData,
>(): PersistedSession<TUserData> | null => {
  try {
    const raw = sessionStorage.getItem(LAST_SESSION_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (isPersistedSession<TUserData>(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
};

export const writePersistedSession = <
  TUserData extends BaseUserData = BaseUserData,
>(
  session: PersistedSession<TUserData> | null,
): void => {
  try {
    if (!session) {
      sessionStorage.removeItem(LAST_SESSION_KEY);
      return;
    }
    sessionStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Fehler bei Browser-Restriktionen (z. B. InPrivate/Incognito) abfangen
  }
};

const readStoredAllowedIds = (): StoredAllowedIds | null => {
  try {
    const raw =
      sessionStorage.getItem(ALLOWED_IDS_STORAGE_KEY) ??
      localStorage.getItem(ALLOWED_IDS_STORAGE_KEY);

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed as StoredAllowedIds;
  } catch {
    return null;
  }
};

const writeStoredAllowedIds = (entries: StoredAllowedIds | null): void => {
  try {
    if (!entries || Object.keys(entries).length === 0) {
      sessionStorage.removeItem(ALLOWED_IDS_STORAGE_KEY);
      localStorage.removeItem(ALLOWED_IDS_STORAGE_KEY);
      return;
    }

    sessionStorage.setItem(ALLOWED_IDS_STORAGE_KEY, JSON.stringify(entries));
    // Altdaten aus localStorage bereinigen
    localStorage.removeItem(ALLOWED_IDS_STORAGE_KEY);
  } catch {
    // Fehler bei Storage-Zugriff abfangen
  }
};

export const readAllowedIds = (roomId: string): Set<string> | null => {
  const entries = readStoredAllowedIds();
  const id = entries?.[roomId];
  if (!id) return null;

  return new Set([id]);
};

export const writeAllowedIds = (
  roomId: string,
  ids: Set<string> | string | null,
): void => {
  try {
    const entries = readStoredAllowedIds() ?? {};

    let singleId: string | undefined;

    if (typeof ids === "string") {
      singleId = ids;
    } else if (ids instanceof Set) {
      singleId = Array.from(ids)[0];
    }

    if (!singleId) {
      delete entries[roomId];
    } else {
      entries[roomId] = singleId;
    }

    writeStoredAllowedIds(entries);
  } catch {
    // Fehler bei Storage-Zugriff abfangen
  }
};
