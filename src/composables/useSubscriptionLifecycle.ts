import { toast } from "vue3-toastify";
import { isHostFlag } from "@/utils/realtime";
import {
  MAX_PLAYERS_REGULAR,
  MAX_PLAYERS_PARTY_NON_HOST,
  NO_HOST_GRACE_MS,
} from "@/stores/channel.constants";
import type { Ref } from "vue";
import type { Router } from "vue-router";
import type { Player } from "@/types/player";

interface PresenceMember {
  name: string;
  avatar: number;
  host: string | boolean | number;
  rounds?: number;
  duration?: number;
}

interface PresenceHash {
  [playerId: string]: PresenceMember | undefined;
}

interface ConfigStore {
  maxRounds: number;
  revealTime: number;
}

interface LoadingState {
  isLoading: Ref<boolean>;
  isReconnecting: boolean;
  setReconnecting(): void;
  clear(): void;
}

interface PlayerManagement {
  playersOnline: Ref<Player[]>;
  rehydrateAllowedIds(): void;
  lockAllowedIdsForRunningGame(): void;
}

interface SessionPersistence {
  readSession(): PersistedSession | null;
  updateGameRunning(
    value: boolean,
    opts: { mode: string; isHost: boolean },
  ): void;
}

interface PersistedSession {
  wasInGame: boolean;
  mode: "regular" | "party";
  lastRole: "host" | "player";
  roomId: string;
  userData: any;
}

export interface UseSubscriptionLifecycleOptions {
  isHost: Ref<boolean>;
  mode: Ref<"regular" | "party">;
  playerId: Ref<string>;
  onlineGameRunning: Ref<boolean>;
  subscribeTimeoutId: Ref<number | null>;
  noHostGraceTimeoutId: Ref<number | null>;
  channel: any;
  configStore: ConfigStore;
  playerMgmt: PlayerManagement;
  sessionPersistence: SessionPersistence;
  loading: LoadingState;
  router: Router;
  reset(): void;
  setGameRunning(value: boolean): void;
  onResubscribed?(): void;
}

export function syncPlayersFromHash(
  hash: PresenceHash,
  configStore: ConfigStore,
): Player[] {
  return Object.keys(hash).reduce<Player[]>((acc, id) => {
    const member = hash[id];
    if (!member) return acc;

    const memberIsHost = isHostFlag(member.host);

    if (memberIsHost && member.rounds != null) {
      configStore.maxRounds = member.rounds;
    }
    if (memberIsHost && member.duration != null) {
      configStore.revealTime = member.duration;
    }

    acc.push({
      playerId: id,
      username: member.name,
      avatarIndex: member.avatar,
      isHost: memberIsHost,
      isOnline: true,
      points: 0,
      hasFinished: false,
      correctAnswers: 0,
    });

    return acc;
  }, []);
}

export function isLobbyFull(
  hash: PresenceHash,
  mode: "regular" | "party",
  isHost: boolean,
  onlineGameRunning: boolean,
): boolean {
  if (isHost || onlineGameRunning) return false;

  const ids = Object.keys(hash);
  const totalMembers = ids.length;
  const nonHostMembers = ids.filter((id) => !isHostFlag(hash[id]?.host)).length;

  return mode === "party"
    ? nonHostMembers > MAX_PLAYERS_PARTY_NON_HOST
    : totalMembers > MAX_PLAYERS_REGULAR;
}

export function hasHostInHash(hash: PresenceHash): boolean {
  return Object.keys(hash).some((id) => isHostFlag(hash[id]?.host));
}

export function useSubscriptionLifecycle({
  isHost,
  mode,
  playerId,
  onlineGameRunning,
  subscribeTimeoutId,
  noHostGraceTimeoutId,
  channel,
  configStore,
  playerMgmt,
  sessionPersistence,
  loading,
  router,
  reset,
  setGameRunning,
  onResubscribed,
}: UseSubscriptionLifecycleOptions): void {
  channel.bind("realtime:subscription_succeeded", (members: any) => {
    if (subscribeTimeoutId.value) {
      window.clearTimeout(subscribeTimeoutId.value);
      subscribeTimeoutId.value = null;
    }

    const hash: PresenceHash = members.presence?.hash ?? {};

    if (isLobbyFull(hash, mode.value, isHost.value, onlineGameRunning.value)) {
      toast.error("Room is already full");
      reset();
      router.push("/");
      return;
    }

    const hostPresent = hasHostInHash(hash);
    if (!isHost.value && !hostPresent) {
      if (!loading.isReconnecting) loading.setReconnecting();

      if (noHostGraceTimeoutId.value) {
        window.clearTimeout(noHostGraceTimeoutId.value);
      }

      noHostGraceTimeoutId.value = window.setTimeout(() => {
        noHostGraceTimeoutId.value = null;

        const stillNoHost = !playerMgmt.playersOnline.value.some(
          (p) => p.isHost,
        );
        if (stillNoHost) {
          if (!loading.isReconnecting) loading.setReconnecting();
          channel.trigger("client-party-state-request", {
            requestedBy: playerId.value,
          });
        }
      }, NO_HOST_GRACE_MS);
    }

    playerMgmt.playersOnline.value = syncPlayersFromHash(hash, configStore);

    if (isHost.value && onlineGameRunning.value) {
      playerMgmt.rehydrateAllowedIds();
    } else {
      playerMgmt.lockAllowedIdsForRunningGame();
    }

    if (loading.isReconnecting) loading.clear();

    if (isHost.value && onlineGameRunning.value) {
      onResubscribed?.();
    }

    const persisted = sessionPersistence.readSession();
    if (persisted?.wasInGame && persisted.mode === mode.value) {
      setGameRunning(true);

      if (mode.value === "party") {
        const currentPath = router.currentRoute.value.path;
        const isOnEntryRoute =
          currentPath === "/" || currentPath === "/play-party";

        if (isOnEntryRoute) {
          router.push(
            persisted.lastRole === "host" ? "/party-host" : "/party-player",
          );
        }

        channel.trigger("client-party-state-request", {
          requestedBy: playerId.value,
        });
      }
    }

    const totalMembers = Object.keys(hash).length;

    if (mode.value === "party" && onlineGameRunning.value) {
      channel.trigger("client-party-state-request", {
        requestedBy: playerId.value,
      });
    }

    if (!isHost.value && (!hostPresent || totalMembers <= 1)) {
      channel.trigger("client-party-state-request", {
        requestedBy: playerId.value,
      });
    }

    const entryRoutes = ["/", "/play-party", "/play-online"];
    if (entryRoutes.includes(router.currentRoute.value.path)) {
      loading.clear();
      router.push(mode.value === "party" ? "/party-lobby" : "/lobby");
    }
  });

  channel.bind("realtime:subscription_error", (err: any) => {
    if (subscribeTimeoutId.value) {
      window.clearTimeout(subscribeTimeoutId.value);
      subscribeTimeoutId.value = null;
    }

    if (err?.type === "AuthError") {
      toast.error(
        "Auth failed (invalid signature). Check APINATOR_SECRET matches your VITE_APINATOR_KEY.",
        { icon: "🔑" },
      );
    } else {
      toast.error("Failed to join room. Please try again.", { icon: "🚫" });
    }

    reset();
    router.push("/");
  });

  channel.bind("realtime:error", (err: any) => {
    console.error("[channel] realtime_error", err);
  });
}
