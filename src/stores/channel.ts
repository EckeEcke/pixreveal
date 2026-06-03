import { defineStore } from "pinia";
import { ref, shallowRef, watch } from "vue";
import { generateRoomId } from "@/utils/crypto";
import { createApinatorClient } from "@/services/apinator";
import { useRouter } from "vue-router";
import { useConfigStore } from "./config";
import { usePlayerStore } from "./player";
import {
  workerClearInterval,
  workerSetInterval,
  workerSetTimeout,
} from "@/services/workerTimers";
import { toast } from "vue3-toastify";
import type { UserData } from "@/types/channel";
import { isHostFlag } from "@/utils/realtime";
import { usePartyStore } from "./party";
import { useConnectionState } from "@/composables/useConnectionState";
import { useInactivity } from "@/composables/useInactivity";
import { usePlayerManagement } from "@/composables/usePlayerManagement";
import { useSessionPersistence } from "@/composables/useSessionPersistence";
import {
  SUBSCRIBE_TIMEOUT_MS,
  NO_HOST_GRACE_MS,
  HEARTBEAT_INTERVAL_MS,
  MAX_PLAYERS_REGULAR,
  MAX_PLAYERS_PARTY_NON_HOST,
} from "./channel.constants";

export const useChannelStore = defineStore("channel", () => {
  const router = useRouter();
  const configStore = useConfigStore();
  const playerStore = usePlayerStore();

  const debug = (...args: any[]) => {
    if (import.meta.env?.DEV) {
      console.log("[channel]", new Date().toISOString(), ...args);
    }
  };

  // ─── Core state ────────────────────────────────────────────────────────────
  const activeChannel = shallowRef<any>(null);
  const client = shallowRef<any>(null);
  const currentRoomId = ref<string | null>(null);
  const playerId = ref("");
  const isHost = ref(false);
  const messages = ref<any[]>([]);
  const mode = ref<"regular" | "party">("party");
  const onlineGameRunning = ref(false);
  const stateChangeHandler = ref<((data: any) => void) | null>(null);
  const heartbeatIntervalId = ref<number | null>(null);
  const subscribeTimeoutId = ref<number | null>(null);
  const noHostGraceTimeoutId = ref<number | null>(null);
  const unloadHandler = ref<(() => void) | null>(null);
  const visibilityHandler = ref<(() => void) | null>(null);

  // ─── Loading state ─────────────────────────────────────────────────────────
  const loading = {
    isLoading: ref(false),
    text: ref("LOADING..."),
    setReconnecting() {
      this.isLoading.value = true;
      this.text.value = "RECONNECTING...";
    },
    clear() {
      this.isLoading.value = false;
      this.text.value = "LOADING...";
    },
    get isReconnecting() {
      return this.isLoading.value && this.text.value === "RECONNECTING...";
    },
  };

  const setMode = (value: "regular" | "party") => {
    mode.value = value;
  };
  const setGameRunning = (value: boolean) => {
    onlineGameRunning.value = value;
  };

  // ─── Composables ───────────────────────────────────────────────────────────
  const sessionPersistence = useSessionPersistence();

  const playerMgmt = usePlayerManagement({
    getIsHost: () => isHost.value,
    getGameRunning: () => onlineGameRunning.value,
    getPlayerId: () => playerId.value,
    getCurrentRoomId: () => currentRoomId.value,
  });

  const inactivity = useInactivity({
    getIsHost: () => isHost.value,
    getGameRunning: () => onlineGameRunning.value,
    getActiveChannel: () => activeChannel.value,
    getPlayerId: () => playerId.value,
    onInactive: ({ skipNavigation, skipReset }) => {
      if (!skipReset) reset();
      if (!skipNavigation) router.push("/");
    },
  });

  const connection = useConnectionState({
    getIsLoading: () => loading.isLoading.value,
    setIsLoading: (v, text) => {
      if (!v && !loading.isReconnecting) return;
      if (v && text) {
        loading.isLoading.value = true;
        loading.text.value = text;
      } else {
        loading.clear();
      }
    },
    getMode: () => mode.value,
    getGameRunning: () => onlineGameRunning.value,
    getPlayerId: () => playerId.value,
    getActiveChannel: () => activeChannel.value,
    onConnectionLost: () => inactivity.handleInactivity(),
  });

  connection.setForceReconnect(() => tryReconnect({ force: true }));

  // ─── Heartbeat ─────────────────────────────────────────────────────────────
  const startHeartbeat = () => {
    if (heartbeatIntervalId.value) return;
    heartbeatIntervalId.value = workerSetInterval(() => {
      if (!activeChannel.value) return;
      activeChannel.value.trigger("client-heartbeat", {
        timestamp: Date.now(),
      });
    }, HEARTBEAT_INTERVAL_MS);
  };

  const stopHeartbeat = () => {
    if (!heartbeatIntervalId.value) return;
    workerClearInterval(heartbeatIntervalId.value);
    heartbeatIntervalId.value = null;
  };

  watch(
    () => [activeChannel.value, onlineGameRunning.value],
    ([channel, running]) => {
      if (channel && running) startHeartbeat();
      else stopHeartbeat();
    },
    { immediate: true },
  );

  // ─── Subscribe timeout ─────────────────────────────────────────────────────
  const startSubscribeTimeout = () => {
    if (subscribeTimeoutId.value) window.clearTimeout(subscribeTimeoutId.value);
    subscribeTimeoutId.value = window.setTimeout(() => {
      if (!loading.isLoading.value) return;
      console.error("Subscription timeout");
      toast.error("Connection timeout. Please try again.", { icon: "⏱️" });
      reset();
      router.push("/");
    }, SUBSCRIBE_TIMEOUT_MS);
  };

  // ─── Reset ─────────────────────────────────────────────────────────────────
  type ResetOptions = {
    clearPersisted?: boolean;
    keepIdentity?: boolean;
    keepGameRunning?: boolean;
  };

  const reset = ({
    clearPersisted = true,
    keepIdentity = false,
    keepGameRunning = false,
  }: ResetOptions = {}) => {
    const prevPlayerId = playerId.value;
    const prevIsHost = isHost.value;
    const prevGameRunning = onlineGameRunning.value;
    const prevMode = mode.value;

    if (activeChannel.value?.unbind) activeChannel.value.unbind();
    if (client.value && currentRoomId.value) {
      client.value.unsubscribe(`presence-pixreveal-${currentRoomId.value}`);
    }
    if (client.value?.disconnect) client.value.disconnect();
    if (client.value?.unbind && stateChangeHandler.value) {
      client.value.unbind("state_change", stateChangeHandler.value);
      stateChangeHandler.value = null;
    }

    activeChannel.value = null;
    client.value = null;
    messages.value = [];
    loading.clear();

    if (!keepIdentity) {
      playerId.value = "";
      isHost.value = false;
      mode.value = "party";
    } else {
      playerId.value = prevPlayerId;
      isHost.value = prevIsHost;
      mode.value = prevMode;
    }

    setGameRunning(keepGameRunning ? prevGameRunning : false);

    const roomIdBeforeClear = currentRoomId.value;
    currentRoomId.value = null;

    playerMgmt.reset(clearPersisted ? roomIdBeforeClear : null);
    inactivity.reset();
    connection.reset();

    if (clearPersisted) sessionPersistence.clearSession();

    if (heartbeatIntervalId.value) {
      workerClearInterval(heartbeatIntervalId.value);
      heartbeatIntervalId.value = null;
    }
    if (subscribeTimeoutId.value) {
      window.clearTimeout(subscribeTimeoutId.value);
      subscribeTimeoutId.value = null;
    }
    if (noHostGraceTimeoutId.value) {
      window.clearTimeout(noHostGraceTimeoutId.value);
      noHostGraceTimeoutId.value = null;
    }
    if (unloadHandler.value) {
      window.removeEventListener("beforeunload", unloadHandler.value);
      unloadHandler.value = null;
    }
    if (visibilityHandler.value) {
      document.removeEventListener("visibilitychange", visibilityHandler.value);
      visibilityHandler.value = null;
    }
  };

  const resetConnection = () =>
    reset({ clearPersisted: false, keepIdentity: true, keepGameRunning: true });

  // ─── Event setup ───────────────────────────────────────────────────────────
  const setupEvents = (myPlayerId: string) => {
    playerId.value = myPlayerId;
    const channel = activeChannel.value;
    if (!channel) return;

    unloadHandler.value = inactivity.handleBeforeUnload;
    window.addEventListener("beforeunload", unloadHandler.value);

    visibilityHandler.value = inactivity.handleVisibilityChange;
    document.addEventListener("visibilitychange", visibilityHandler.value);

    channel.bind("realtime:subscription_succeeded", (members: any) => {
      debug("subscription_succeeded", {
        roomId: currentRoomId.value,
        isHost: isHost.value,
        mode: mode.value,
      });

      if (subscribeTimeoutId.value) {
        window.clearTimeout(subscribeTimeoutId.value);
        subscribeTimeoutId.value = null;
      }

      const hash = members.presence?.hash || {};
      const totalMembers = Object.keys(hash).length;
      const hasHost = Object.keys(hash).some((id) =>
        isHostFlag(hash[id]?.host),
      );
      const nonHostMembers = Object.keys(hash).filter(
        (id) => !isHostFlag(hash[id]?.host),
      ).length;

      // Client-side lobby limit enforcement.
      if (!isHost.value && !onlineGameRunning.value) {
        const isFull =
          mode.value === "party"
            ? nonHostMembers > MAX_PLAYERS_PARTY_NON_HOST
            : totalMembers > MAX_PLAYERS_REGULAR;
        if (isFull) {
          toast.error("Room is already full");
          reset();
          router.push("/");
          return;
        }
      }

      if (!isHost.value && !hasHost) {
        debug("no_host_presence", { totalMembers });
        if (!loading.isReconnecting) loading.setReconnecting();
        if (noHostGraceTimeoutId.value)
          window.clearTimeout(noHostGraceTimeoutId.value);
        noHostGraceTimeoutId.value = window.setTimeout(() => {
          noHostGraceTimeoutId.value = null;
          const stillNoHost = !playerMgmt.playersOnline.value.some(
            (p) => p.isHost,
          );
          if (stillNoHost) {
            if (!loading.isReconnecting) loading.setReconnecting();
            activeChannel.value?.trigger("client-party-state-request", {
              requestedBy: playerId.value,
            });
          }
        }, NO_HOST_GRACE_MS);
      }

      const nextPlayers = Object.keys(hash).map((id) => {
        if (isHostFlag(hash[id].host) && hash[id].rounds)
          configStore.maxRounds = hash[id].rounds;
        if (isHostFlag(hash[id].host) && hash[id].duration)
          configStore.revealTime = hash[id].duration;
        return {
          playerId: id,
          username: hash[id].name,
          avatarIndex: hash[id].avatar,
          isHost: isHostFlag(hash[id].host),
          isOnline: true,
          points: 0,
          hasFinished: false,
          correctAnswers: 0,
        };
      });

      playerMgmt.playersOnline.value = nextPlayers;

      // Rehydrate allowlist on host reconnect.
      if (isHost.value && onlineGameRunning.value) {
        playerMgmt.rehydrateAllowedIds();
      } else {
        playerMgmt.lockAllowedIdsForRunningGame();
      }

      if (loading.isReconnecting) loading.clear();

      // On host reconnect broadcast party state so controllers resync.
      if (isHost.value && mode.value === "party" && onlineGameRunning.value) {
        workerSetTimeout(() => {
          try {
            usePartyStore().broadcastPartyState?.("host-resubscribed");
          } catch {
            /* ignore */
          }
        }, 0);
      }

      const persisted = sessionPersistence.readSession();
      if (persisted?.wasInGame && persisted?.mode === mode.value) {
        setGameRunning(true);
        if (mode.value === "party") {
          if (
            router.currentRoute.value.path === "/" ||
            router.currentRoute.value.path === "/play-party"
          ) {
            if (persisted.lastRole === "host") router.push("/party-host");
            else router.push("/party-player");
          }
          activeChannel.value?.trigger("client-party-state-request", {
            requestedBy: playerId.value,
          });
        }
      }

      if (mode.value === "party" && onlineGameRunning.value) {
        channel.trigger("client-party-state-request", {
          requestedBy: playerId.value,
        });
      }

      if (!isHost.value && (!hasHost || totalMembers <= 1)) {
        channel.trigger("client-party-state-request", {
          requestedBy: playerId.value,
        });
      }

      if (
        router.currentRoute.value.path === "/" ||
        router.currentRoute.value.path === "/play-party" ||
        router.currentRoute.value.path === "/play-online"
      ) {
        loading.clear();
        router.push(mode.value === "party" ? "/party-lobby" : "/lobby");
      }
    });

    channel.bind("realtime:subscription_error", (err: any) => {
      debug("subscription_error", err);
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
      debug("realtime_error", err);
      console.error("Realtime error:", err);
    });

    channel.bind("realtime:member_added", (member: any) => {
      playerMgmt.addPlayer({
        playerId: member.user_id,
        username: member.user_info.name,
        avatarIndex: member.user_info.avatar,
        isHost: isHostFlag(member.user_info.host),
        isOnline: true,
        points: 0,
        hasFinished: false,
        correctAnswers: 0,
      });
      messages.value.push({
        id: `sys-${Date.now()}`,
        username: "System",
        text: `${member.user_info.name} joined the lobby`,
        isSystem: true,
      });

      // Cancel no-host grace if host just appeared.
      if (
        !isHost.value &&
        isHostFlag(member.user_info.host) &&
        noHostGraceTimeoutId.value
      ) {
        window.clearTimeout(noHostGraceTimeoutId.value);
        noHostGraceTimeoutId.value = null;
        if (loading.isReconnecting) loading.clear();
      }

      if (isHost.value && onlineGameRunning.value) {
        playerMgmt.allowRejoinDuringRunningGame(member.user_id);
        if (
          playerMgmt.allowedIdsDuringGame.value &&
          !playerMgmt.allowedIdsDuringGame.value.has(member.user_id)
        ) {
          channel.trigger("client-join-blocked", { targetId: member.user_id });
        }
      }

      // Lobby limit enforcement.
      if (isHost.value && !onlineGameRunning.value) {
        if (mode.value === "party") {
          const nonHostCount = playerMgmt.playersOnline.value.filter(
            (p) => !p.isHost,
          ).length;
          if (nonHostCount > MAX_PLAYERS_PARTY_NON_HOST) {
            channel.trigger("client-join-blocked", {
              targetId: member.user_id,
            });
          }
        } else {
          if (playerMgmt.playersOnline.value.length > MAX_PLAYERS_REGULAR) {
            channel.trigger("client-join-blocked", {
              targetId: member.user_id,
            });
          }
        }
      }
    });

    channel.bind("realtime:member_removed", (member: any) => {
      playerMgmt.removePlayer(member.user_id || member.id);
    });

    channel.bind("client-join-blocked", (data: { targetId?: string }) => {
      if (!data?.targetId || String(data.targetId) !== playerId.value) return;
      toast.error("Room is already full");
      reset();
      router.push("/");
    });

    channel.bind("client-chat-message", (data: any) => {
      messages.value.push({
        ...data,
        isSystem: false,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });
  };

  // ─── Session creation helpers ──────────────────────────────────────────────
  const createClientAndBind = () => {
    const handler = connection.createStateChangeHandler();
    stateChangeHandler.value = handler;
    return handler;
  };

  const hostSession = (userData: UserData) => {
    const clientInstance = createApinatorClient(userData);
    client.value = clientInstance;
    const handler = createClientAndBind();
    clientInstance.bind("state_change", handler as any);
    clientInstance.connect();

    const roomId = generateRoomId();
    const channelInstance = clientInstance.subscribe(
      `presence-pixreveal-${roomId}`,
    );
    activeChannel.value = channelInstance;
    currentRoomId.value = roomId;
    isHost.value = true;

    setupEvents(userData.playerId);
    startSubscribeTimeout();

    sessionPersistence.persistSession({
      roomId,
      userData,
      mode: mode.value,
      wasInGame: false,
      lastRole: "host",
    });

    return roomId;
  };

  const joinSession = (
    userData: UserData,
    roomId: string,
    role: "host" | "player" = "player",
  ) => {
    const clientInstance = createApinatorClient(userData);
    client.value = clientInstance;
    const handler = createClientAndBind();
    clientInstance.bind("state_change", handler as any);
    clientInstance.connect();

    const channelInstance = clientInstance.subscribe(
      `presence-pixreveal-${roomId}`,
    );
    activeChannel.value = channelInstance;
    currentRoomId.value = roomId;

    setupEvents(userData.playerId);
    startSubscribeTimeout();

    sessionPersistence.persistSession({
      roomId,
      userData,
      mode: mode.value,
      wasInGame: false,
      lastRole: role,
    });
  };

  // ─── Public actions ────────────────────────────────────────────────────────
  const setGameRunningWithPersist = (value: boolean) => {
    setGameRunning(value);
    if (value) playerMgmt.lockAllowedIdsForRunningGame();
    sessionPersistence.updateGameRunning(value, {
      mode: mode.value,
      isHost: isHost.value,
    });
    if (!value) playerMgmt.allowedIdsDuringGame.value = null;
  };

  const tryReconnect = ({ force = false }: { force?: boolean } = {}) => {
    if ((activeChannel.value || client.value) && !force) return false;
    const persisted = sessionPersistence.readSession();
    if (!persisted) return false;

    if (force) resetConnection();

    setMode(persisted.mode);
    const role = persisted.lastRole === "host" ? "host" : "player";
    isHost.value = role === "host" || !!persisted.userData.isHost;
    playerId.value = persisted.userData.playerId;

    const nextUserData =
      role === "host"
        ? { ...persisted.userData, isHost: true }
        : { ...persisted.userData, isHost: false };

    joinSession(nextUserData, persisted.roomId, role);
    loading.setReconnecting();
    return true;
  };

  const sendChatMessage = (text: string) => {
    if (!activeChannel.value || text.trim() === "") return;
    const messageData = {
      id: `${playerId.value}-${Date.now()}`,
      playerId: playerId.value,
      username: playerStore.playerName,
      text,
      avatarIndex: playerStore.avatarIndex,
    };
    activeChannel.value.trigger("client-chat-message", messageData);
    messages.value.push({
      ...messageData,
      isSystem: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
  };

  return {
    // State
    playersOnline: playerMgmt.playersOnline,
    activeChannel,
    currentRoomId,
    isHost,
    playerId,
    messages,
    isLoading: loading.isLoading,
    loadingText: loading.text,
    mode,
    onlineGameRunning,
    connectionState: connection.connectionState,
    // Actions
    setMode,
    setGameRunning: setGameRunningWithPersist,
    hostSession,
    joinSession,
    tryReconnect,
    sendChatMessage,
    removePlayer: playerMgmt.removePlayer,
    reset,
    resetConnection,
    allowRejoinDuringRunningGame: playerMgmt.allowRejoinDuringRunningGame,
  };
});