import {
  readPersistedSession,
  writePersistedSession,
} from "@/services/channelPersistence";
import type { PersistedSession as BasePersistedSession } from "@/services/channelPersistence";
import type { UserData } from "@/types/channel";

type PersistedSession = BasePersistedSession<UserData>;

export function useSessionPersistence() {
  const persistSession = (session: PersistedSession | null) => {
    writePersistedSession<UserData>(session);
  };

  const readSession = () => readPersistedSession<UserData>();

  const updateGameRunning = (
    value: boolean,
    opts: { mode: "regular" | "party"; isHost: boolean },
  ) => {
    const persisted = readSession();
    if (!persisted) return;
    persistSession({
      ...persisted,
      wasInGame: value,
      mode: opts.mode,
      lastRole: opts.isHost ? "host" : "player",
    });
  };

  const clearSession = () => persistSession(null);

  return {
    persistSession,
    readSession,
    updateGameRunning,
    clearSession,
  };
}
