import { defineStore } from "pinia";
import { ref, shallowRef, watch } from "vue";
import { generateRoomId } from "@/utils/crypto";
import { createApinatorClient } from "@/services/apinator";
import { useRouter } from "vue-router";
import { useConfigStore } from "./config";
import { usePlayerStore } from "./player";
import { workerClearInterval, workerSetInterval } from "@/services/workerTimers";
import { toast } from "vue3-toastify";

export interface UserData {
  playerId: string;
  username: string;
  avatarIndex: number;
  isHost: boolean;
  rounds?: number;
  revealTime?: number;
}

export interface Player {
  playerId: string;
  username: string;
  avatarIndex: number;
  isHost: boolean;
  isOnline: boolean;
  points: number;
  hasFinished: boolean;
  correctAnswers: number;
}

export const useChannelStore = defineStore("channel", () => {
  const router = useRouter();
    const configStore = useConfigStore();
    const playerStore = usePlayerStore();

  const playersOnline = ref<Player[]>([]);
  const activeChannel = shallowRef<any>(null);
  const client = shallowRef<any>(null);
  const currentRoomId = ref<string | null>(null);
  const playerId = ref("");
  const isHost = ref(false);
  const messages = ref<any[]>([]);
  const isLoading = ref(false);
  const loadingText = ref("LOADING...");
  const mode = ref<"regular" | "party">("party");
  const setMode = (value: "regular" | "party") => {
    mode.value = value;
  };
  const onlineGameRunning = ref(false);
  const setGameRunning = (value: boolean) => {
    onlineGameRunning.value = value;
  };
  const inactivityNotified = ref(false);
  const inactivityGraceTimeoutId = ref<number | null>(null);
  const allowedIdsDuringGame = ref<Set<string> | null>(null);
  const ALLOWED_IDS_PREFIX = "pixreveal:allowedIds:";

  const STORAGE_KEY = "pixreveal:lastSession";
  type PersistedSession = {
    roomId: string;
    userData: UserData;
    mode: "regular" | "party";
    wasInGame: boolean;
    lastRole: "host" | "player";
  };

  const persistSession = (session: PersistedSession | null) => {
    try {
      if (!session) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore storage failures
    }
  };

  const allowedIdsStorageKey = (roomId: string) => `${ALLOWED_IDS_PREFIX}${roomId}`;

  const isHostFlag = (value: any) =>
    value === true || value === 1 || value === "1" || value === "true";

  const readAllowedIds = (roomId: string): Set<string> | null => {
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

  const writeAllowedIds = (roomId: string, ids: Set<string> | null) => {
    try {
      if (!ids) {
        localStorage.removeItem(allowedIdsStorageKey(roomId));
        return;
      }
      localStorage.setItem(allowedIdsStorageKey(roomId), JSON.stringify([...ids]));
    } catch {
      // ignore storage failures
    }
  };

  const readPersistedSession = (): PersistedSession | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedSession;
      if (!parsed?.roomId || !parsed?.userData?.playerId) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const clearInactivityGrace = () => {
    if (!inactivityGraceTimeoutId.value) return;
    window.clearTimeout(inactivityGraceTimeoutId.value);
    inactivityGraceTimeoutId.value = null;
  };

  const unloadHandler = ref<(() => void) | null>(null);
  const visibilityHandler = ref<(() => void) | null>(null);
  const heartbeatIntervalId = ref<number | null>(null);
  const subscribeTimeoutId = ref<number | null>(null);
  const noHostGraceTimeoutId = ref<number | null>(null);
  const connectionLossTimeoutId = ref<number | null>(null);
  const stateChangeHandler = ref<((data: any) => void) | null>(null);

  const clearConnectionLossTimeout = () => {
    if (!connectionLossTimeoutId.value) return;
    window.clearTimeout(connectionLossTimeoutId.value);
    connectionLossTimeoutId.value = null;
  };

  type ResetOptions = { clearPersisted?: boolean };

  const reset = ({ clearPersisted = true }: ResetOptions = {}) => {
    if (activeChannel.value?.unbind) {
      // defensive: remove any lingering handlers before dropping references
      activeChannel.value.unbind();
    }
    if (client.value && currentRoomId.value) {
      client.value.unsubscribe(`presence-pixreveal-${currentRoomId.value}`);
    }
    if (client.value?.disconnect) {
      client.value.disconnect();
    }
    if (client.value?.unbind && stateChangeHandler.value) {
      client.value.unbind("state_change", stateChangeHandler.value);
      stateChangeHandler.value = null;
    }
    playersOnline.value = [];
    activeChannel.value = null;
    client.value = null;
    currentRoomId.value = null;
    messages.value = [];
    isLoading.value = false;
    playerId.value = "";
    setGameRunning(false);
    inactivityNotified.value = false;
    clearInactivityGrace();
    clearConnectionLossTimeout();
    allowedIdsDuringGame.value = null;
    if (clearPersisted && currentRoomId.value) {
      writeAllowedIds(currentRoomId.value, null);
    }
    if (clearPersisted) {
      persistSession(null);
    }

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
      document.removeEventListener(
        "visibilitychange",
        visibilityHandler.value,
      );
      visibilityHandler.value = null;
    }
  };

  const handleInactivity = ({
    skipNavigation = false,
    skipReset = false,
  }: { skipNavigation?: boolean; skipReset?: boolean } = {}) => {
    if (
      inactivityNotified.value ||
      !onlineGameRunning.value ||
      !activeChannel.value ||
      !playerId.value
    ) {
      return;
    }
    inactivityNotified.value = true;

    const eventName = isHost.value
      ? "client-host-inactive"
      : "client-player-inactive";
    activeChannel.value.trigger(eventName, {
      playerId: playerId.value,
    });

    if (!skipReset) {
      reset();
    }

    if (!skipNavigation) {
      router.push("/");
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      clearInactivityGrace();
      return;
    }

    // Grace period so short connection loss / app switch can recover via reconnect.
    clearInactivityGrace();
    inactivityGraceTimeoutId.value = window.setTimeout(() => {
      inactivityGraceTimeoutId.value = null;
      handleInactivity();
    }, 30000);
  };

  const resetConnection = () => reset({ clearPersisted: false });

  const handleBeforeUnload = () => {
    handleInactivity({ skipNavigation: true });
  };

  const setChannel = (channel: any, roomId: string) => {
    activeChannel.value = channel;
    currentRoomId.value = roomId;
  };

  const lockAllowedIdsForRunningGame = () => {
    if (!isHost.value || !onlineGameRunning.value) return;
    const ids = new Set(playersOnline.value.map((p) => p.playerId));
    if (playerId.value) ids.add(playerId.value);
    allowedIdsDuringGame.value = ids;
    if (currentRoomId.value) writeAllowedIds(currentRoomId.value, ids);
  };

  const allowRejoinDuringRunningGame = (id: string) => {
    if (!isHost.value || !onlineGameRunning.value) return;
    if (!allowedIdsDuringGame.value) {
      allowedIdsDuringGame.value = new Set<string>();
    }
    allowedIdsDuringGame.value.add(id);
    if (currentRoomId.value) writeAllowedIds(currentRoomId.value, allowedIdsDuringGame.value);
  };

  const startSubscribeTimeout = () => {
    if (subscribeTimeoutId.value) window.clearTimeout(subscribeTimeoutId.value);
    subscribeTimeoutId.value = window.setTimeout(() => {
      if (!isLoading.value) return;
      console.error("Subscription timeout");
      toast.error("Connection timeout. Please try again.", { icon: "⏱️" });
      reset();
      router.push("/");
    }, 12000);
  };

  const startHeartbeat = () => {
    if (heartbeatIntervalId.value) return;
    heartbeatIntervalId.value = workerSetInterval(() => {
      if (!activeChannel.value) return;
      activeChannel.value.trigger("client-heartbeat", { timestamp: Date.now() });
    }, 20000);
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

  const addPlayer = (player: Player) => {
    if (!playersOnline.value.some((p) => p.playerId === player.playerId)) {
      playersOnline.value.push(player);
    }
  };

  const removePlayer = (id: string) => {
    playersOnline.value = playersOnline.value.filter((p) => p.playerId !== id);
  };

  const setupEvents = (myPlayerId: string) => {
    playerId.value = myPlayerId;
    const channel = activeChannel.value;
    if (!channel) return;

    unloadHandler.value = handleBeforeUnload;
    window.addEventListener("beforeunload", unloadHandler.value);

    visibilityHandler.value = handleVisibilityChange;
    document.addEventListener("visibilitychange", visibilityHandler.value);

    channel.bind("realtime:subscription_succeeded", (members: any) => {
      if (subscribeTimeoutId.value) {
        window.clearTimeout(subscribeTimeoutId.value);
        subscribeTimeoutId.value = null;
      }
      const hash = members.presence?.hash || {};
      const totalMembers = Object.keys(hash).length;
      const hasHost = Object.keys(hash).some((id) => isHostFlag(hash[id]?.host));

      if (!isHost.value && !hasHost) {
        console.warn(
          "Kein Host in Presence-Hash gefunden. Warte kurz auf Presence sync...",
          { totalMembers },
        );

        if (!isLoading.value) {
          isLoading.value = true;
          loadingText.value = "RECONNECTING...";
        }

        if (noHostGraceTimeoutId.value) {
          window.clearTimeout(noHostGraceTimeoutId.value);
        }
        noHostGraceTimeoutId.value = window.setTimeout(() => {
          noHostGraceTimeoutId.value = null;
          const stillNoHost = !playersOnline.value.some((p) => p.isHost);
          if (stillNoHost) {
            console.error("Kein Host gefunden (nach Grace Period).");
            reset();
            isLoading.value = false;
            router.push("/");
            return;
          }
        }, 8000);
      }

      const nextPlayers: Player[] = Object.keys(hash).map((id) => {
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

      // Replace list to avoid stale/duplicate entries across reconnects.
      playersOnline.value = nextPlayers;

      // Rehydrate allowlist on host reconnect so previously connected controllers
      // aren't incorrectly kicked due to partial presence snapshots.
      if (isHost.value && onlineGameRunning.value && currentRoomId.value) {
        const persistedAllow = readAllowedIds(currentRoomId.value);
        if (persistedAllow) {
          if (!allowedIdsDuringGame.value) {
            allowedIdsDuringGame.value = persistedAllow;
          } else {
            persistedAllow.forEach((id) => allowedIdsDuringGame.value?.add(id));
          }
          writeAllowedIds(currentRoomId.value, allowedIdsDuringGame.value);
        } else {
          // fall back to current presence if no storage
          lockAllowedIdsForRunningGame();
        }
      } else {
        lockAllowedIdsForRunningGame();
      }

      // If we were showing a reconnect overlay, hide it after we are back.
      if (isLoading.value && loadingText.value === "RECONNECTING...") {
        isLoading.value = false;
      }

      const persisted = readPersistedSession();
      if (persisted?.wasInGame && persisted?.mode === mode.value) {
        // mark as running (but keep player list from presence)
        setGameRunning(true);

        if (router.currentRoute.value.path === "/") {
          if (persisted.lastRole === "host") router.push("/party-host");
          else router.push("/party-player");
        }

        activeChannel.value?.trigger("client-party-state-request", {
          requestedBy: playerId.value,
        });
      }

      // Always request a fresh party state after (re)subscription while a party game is running.
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

      if (router.currentRoute.value.path === "/") {
        isLoading.value = false;
        router.push(mode.value === "party" ? "/party-lobby" : "/lobby");
      }
    });

    channel.bind("realtime:subscription_error", (err: any) => {
      if (subscribeTimeoutId.value) {
        window.clearTimeout(subscribeTimeoutId.value);
        subscribeTimeoutId.value = null;
      }
      console.error("Subscription error:", err);
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
      console.error("Realtime error:", err);
    });

    channel.bind("realtime:member_added", (member: any) => {
      addPlayer({
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

      // If we were waiting for a host to appear (grace period), cancel as soon as we see one.
      if (!isHost.value && isHostFlag(member.user_info.host) && noHostGraceTimeoutId.value) {
        window.clearTimeout(noHostGraceTimeoutId.value);
        noHostGraceTimeoutId.value = null;
        if (isLoading.value && loadingText.value === "RECONNECTING...") {
          isLoading.value = false;
        }
      }

      if (isHost.value && onlineGameRunning.value) {
        const allowed = allowedIdsDuringGame.value;
        // If the host reconnected, allowedIdsDuringGame may have been rebuilt from a
        // partial presence hash (missing temporarily disconnected players). Allow
        // rejoiners to prevent false kicks mid-game.
        allowRejoinDuringRunningGame(member.user_id);
        if (allowed && !allowed.has(member.user_id)) {
          // Should be rare now, but keep the kick as a safeguard if allow set is present
          // and still doesn't include the id (e.g. truly new joiner with different id).
          channel.trigger("client-join-blocked", { targetId: member.user_id });
        }
      }
    });

    channel.bind("realtime:member_removed", (member: any) => {
      removePlayer(member.user_id || member.id);
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

  const hostSession = (userData: UserData) => {
    const clientInstance = createApinatorClient(userData);
    client.value = clientInstance;

    // Observe connection state changes so we can show a reconnect overlay and
    // re-request state after transient connection losses (without reload).
    stateChangeHandler.value = ({ current }: { previous: string; current: string }) => {
      if (current === "connected") {
        clearConnectionLossTimeout();
        clearInactivityGrace();
        if (isLoading.value && loadingText.value === "RECONNECTING...") {
          isLoading.value = false;
        }
        if (mode.value === "party" && onlineGameRunning.value && activeChannel.value) {
          activeChannel.value.trigger("client-party-state-request", {
            requestedBy: playerId.value,
          });
        }
        return;
      }

      if (current === "disconnected" || current === "unavailable") {
        if (!isLoading.value) {
          isLoading.value = true;
          loadingText.value = "RECONNECTING...";
        }

        clearConnectionLossTimeout();
        connectionLossTimeoutId.value = window.setTimeout(() => {
          connectionLossTimeoutId.value = null;
          // If we cannot recover after a while, treat it as inactivity.
          handleInactivity();
        }, 60000);
      }
    };
    clientInstance.bind("state_change", stateChangeHandler.value as any);

    clientInstance.connect();

    const roomId = generateRoomId();
    const channelInstance = clientInstance.subscribe(
      `presence-pixreveal-${roomId}`,
    );

    setChannel(channelInstance, roomId);
    isHost.value = true;
    setupEvents(userData.playerId);
    startSubscribeTimeout();
    setMode(userData.isHost && userData.playerId ? mode.value : mode.value);

    persistSession({
      roomId,
      userData,
      mode: mode.value,
      wasInGame: false,
      lastRole: "host",
    });
    return roomId;
  };

  const joinSession = (userData: UserData, roomId: string) => {
    const clientInstance = createApinatorClient(userData);
    client.value = clientInstance;

    stateChangeHandler.value = ({ current }: { previous: string; current: string }) => {
      if (current === "connected") {
        clearConnectionLossTimeout();
        clearInactivityGrace();
        if (isLoading.value && loadingText.value === "RECONNECTING...") {
          isLoading.value = false;
        }
        if (mode.value === "party" && onlineGameRunning.value && activeChannel.value) {
          activeChannel.value.trigger("client-party-state-request", {
            requestedBy: playerId.value,
          });
        }
        return;
      }

      if (current === "disconnected" || current === "unavailable") {
        if (!isLoading.value) {
          isLoading.value = true;
          loadingText.value = "RECONNECTING...";
        }

        clearConnectionLossTimeout();
        connectionLossTimeoutId.value = window.setTimeout(() => {
          connectionLossTimeoutId.value = null;
          handleInactivity();
        }, 60000);
      }
    };
    clientInstance.bind("state_change", stateChangeHandler.value as any);

    clientInstance.connect();

    const channelInstance = clientInstance.subscribe(
      `presence-pixreveal-${roomId}`,
    );

    setChannel(channelInstance, roomId);
    setupEvents(userData.playerId);
    startSubscribeTimeout();

    persistSession({
      roomId,
      userData,
      mode: mode.value,
      wasInGame: false,
      lastRole: "player",
    });
  };

  const setGameRunningWithPersist = (value: boolean) => {
    setGameRunning(value);
    if (value) lockAllowedIdsForRunningGame();

    const persisted = readPersistedSession();
    if (persisted) {
      persistSession({
        ...persisted,
        wasInGame: value,
        mode: mode.value,
        lastRole: isHost.value ? "host" : "player",
      });
    }

    if (!value) {
      allowedIdsDuringGame.value = null;
    }
  };

  const tryReconnect = () => {
    if (activeChannel.value || client.value) return false;
    const persisted = readPersistedSession();
    if (!persisted) return false;

    setMode(persisted.mode);
    isHost.value = !!persisted.userData.isHost;
    playerId.value = persisted.userData.playerId;

    joinSession(persisted.userData, persisted.roomId);
    isLoading.value = true;
    loadingText.value = "RECONNECTING...";
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
    playersOnline,
    activeChannel,
    currentRoomId,
    isHost,
    playerId,
    messages,
    isLoading,
    loadingText,
    mode,
    onlineGameRunning,
    setMode,
    setGameRunning: setGameRunningWithPersist,
    hostSession,
    joinSession,
    tryReconnect,
    sendChatMessage,
    removePlayer,
    reset,
    resetConnection,
    allowRejoinDuringRunningGame,
  };
});
