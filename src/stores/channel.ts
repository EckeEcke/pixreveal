import { defineStore } from "pinia";
import { ref, shallowRef, watch } from "vue";
import { generateRoomId } from "@/utils/crypto";
import { createApinatorClient } from "@/services/apinator";
import { useRouter } from "vue-router";
import { useConfigStore } from "./config";
import { usePlayerStore } from "./player";
import { workerClearInterval, workerSetInterval, workerSetTimeout } from "@/services/workerTimers";
import { toast } from "vue3-toastify";
import type { Player, UserData } from "@/types/channel";
import {
  readAllowedIds,
  readPersistedSession,
  writeAllowedIds,
  writePersistedSession,
} from "@/services/channelPersistence";
import { isHostFlag } from "@/utils/realtime";
import { usePartyStore } from "./party";

export const useChannelStore = defineStore("channel", () => {
  const router = useRouter();
    const configStore = useConfigStore();
    const playerStore = usePlayerStore();

  const MAX_PLAYERS_REGULAR = 8;
  // In local party mode, the host is NOT counted towards the player limit.
  const MAX_PLAYERS_PARTY_NON_HOST = 8;

  const debug = (...args: any[]) => {
    if (import.meta.env?.DEV) {
      console.log("[channel]", new Date().toISOString(), ...args);
    }
  };

  const playersOnline = ref<Player[]>([]);
  const activeChannel = shallowRef<any>(null);
  const client = shallowRef<any>(null);
  const connectionState = ref<string>("unknown");
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

  type PersistedSession = import("@/services/channelPersistence").PersistedSession<UserData>;

  const persistSession = (session: PersistedSession | null) => {
    writePersistedSession<UserData>(session);
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
  const connectWatchdogTimeoutId = ref<number | null>(null);
  const lastForceReconnectAt = ref<number>(0);

  const clearConnectWatchdog = () => {
    if (!connectWatchdogTimeoutId.value) return;
    window.clearTimeout(connectWatchdogTimeoutId.value);
    connectWatchdogTimeoutId.value = null;
  };

  const scheduleConnectWatchdog = () => {
    clearConnectWatchdog();
    // If the client gets stuck in "connecting" for too long, force a reconnect.
    connectWatchdogTimeoutId.value = window.setTimeout(() => {
      connectWatchdogTimeoutId.value = null;
      if (connectionState.value !== "connecting") return;
      const now = Date.now();
      if (now - lastForceReconnectAt.value < 8000) return;
      lastForceReconnectAt.value = now;
      debug("connect_watchdog_force_reconnect");
      tryReconnect({ force: true });
    }, 3000);
  };

  const clearConnectionLossTimeout = () => {
    if (!connectionLossTimeoutId.value) return;
    window.clearTimeout(connectionLossTimeoutId.value);
    connectionLossTimeoutId.value = null;
  };

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
    if (activeChannel.value?.unbind) {
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
    connectionState.value = "unknown";
    currentRoomId.value = null;
    messages.value = [];
    isLoading.value = false;
    if (!keepIdentity) {
      playerId.value = "";
      isHost.value = false;
      mode.value = "party";
    } else {
      playerId.value = prevPlayerId;
      isHost.value = prevIsHost;
      mode.value = prevMode;
    }

    if (!keepGameRunning) {
      setGameRunning(false);
    } else {
      setGameRunning(prevGameRunning);
    }
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
    clearConnectWatchdog();

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

  const resetConnection = () =>
    reset({ clearPersisted: false, keepIdentity: true, keepGameRunning: true });

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
    }, 22000);
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
      const hasHost = Object.keys(hash).some((id) => isHostFlag(hash[id]?.host));
      const nonHostMembers = Object.keys(hash).filter((id) => !isHostFlag(hash[id]?.host))
        .length;

      // Client-side lobby limit enforcement.
      // This prevents "over-joining" if the host tab is backgrounded and doesn't react quickly.
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
            // Don't hard-kick immediately; stay on the current view and keep trying to recover.
            // This avoids players being sent to home due to transient presence gaps.
            if (!isLoading.value) isLoading.value = true;
            loadingText.value = "RECONNECTING...";

            // Keep requesting state periodically; party store / player view will handle further recovery.
            activeChannel.value?.trigger("client-party-state-request", {
              requestedBy: playerId.value,
            });
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

      // On host reconnect, proactively broadcast the current party state so
      // controllers resync immediately without waiting for periodic updates.
      if (isHost.value && mode.value === "party" && onlineGameRunning.value) {
        workerSetTimeout(() => {
          try {
            usePartyStore().broadcastPartyState?.("host-resubscribed");
          } catch {
            // ignore
          }
        }, 0);
      }

      const persisted = readPersistedSession<UserData>();
      if (persisted?.wasInGame && persisted?.mode === mode.value) {
        // mark as running (but keep player list from presence)
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

      if (
        router.currentRoute.value.path === "/" ||
        router.currentRoute.value.path === "/play-party" ||
        router.currentRoute.value.path === "/play-online"
      ) {
        isLoading.value = false;
        router.push(mode.value === "party" ? "/party-lobby" : "/lobby");
      }
    });

    channel.bind("realtime:subscription_error", (err: any) => {
      debug("subscription_error", err);
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
      debug("realtime_error", err);
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

      // Lobby player limit enforcement (host only).
      if (isHost.value && !onlineGameRunning.value) {
        if (mode.value === "party") {
          const nonHostCount = playersOnline.value.filter((p) => !p.isHost).length;
          if (nonHostCount > MAX_PLAYERS_PARTY_NON_HOST) {
            channel.trigger("client-join-blocked", { targetId: member.user_id });
          }
        } else {
          const totalCount = playersOnline.value.length;
          if (totalCount > MAX_PLAYERS_REGULAR) {
            channel.trigger("client-join-blocked", { targetId: member.user_id });
          }
        }
      }
    });

    channel.bind("realtime:member_removed", (member: any) => {
      removePlayer(member.user_id || member.id);
    });

    channel.bind("client-join-blocked", (data: { targetId?: string }) => {
      const targetId = String(data?.targetId || "");
      if (!targetId || targetId !== playerId.value) return;
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

  const hostSession = (userData: UserData) => {
    const clientInstance = createApinatorClient(userData);
    client.value = clientInstance;

    stateChangeHandler.value = ({ current }: { previous: string; current: string }) => {
      debug("state_change", { current });
      connectionState.value = current ?? "unknown";
      if (current === "connected") {
        clearConnectWatchdog();
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
        debug("connection_lost", { current });
        clearConnectWatchdog();
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

      if (current === "connecting") {
        scheduleConnectWatchdog();
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

  const joinSession = (
    userData: UserData,
    roomId: string,
    role: "host" | "player" = "player",
  ) => {
    const clientInstance = createApinatorClient(userData);
    client.value = clientInstance;

    stateChangeHandler.value = ({ current }: { previous: string; current: string }) => {
      debug("state_change", { current });
      connectionState.value = current ?? "unknown";
      if (current === "connected") {
        clearConnectWatchdog();
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
        debug("connection_lost", { current });
        clearConnectWatchdog();
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

      if (current === "connecting") {
        scheduleConnectWatchdog();
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
      lastRole: role,
    });
  };

  const setGameRunningWithPersist = (value: boolean) => {
    setGameRunning(value);
    if (value) lockAllowedIdsForRunningGame();

    const persisted = readPersistedSession<UserData>();
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

  const tryReconnect = ({ force = false }: { force?: boolean } = {}) => {
    if ((activeChannel.value || client.value) && !force) return false;
    const persisted = readPersistedSession<UserData>();
    if (!persisted) return false;

    if (force) {
      // Tear down current connection but keep persisted session so we can rejoin.
      resetConnection();
    }

    setMode(persisted.mode);
    const role = persisted.lastRole === "host" ? "host" : "player";
    isHost.value = role === "host" || !!persisted.userData.isHost;
    playerId.value = persisted.userData.playerId;

    const nextUserData =
      role === "host"
        ? { ...persisted.userData, isHost: true }
        : { ...persisted.userData, isHost: false };

    joinSession(nextUserData, persisted.roomId, role);
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
    connectionState,
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
