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

  const unloadHandler = ref<(() => void) | null>(null);
  const visibilityHandler = ref<(() => void) | null>(null);
  const heartbeatIntervalId = ref<number | null>(null);
  const subscribeTimeoutId = ref<number | null>(null);

  const reset = () => {
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
    playersOnline.value = [];
    activeChannel.value = null;
    client.value = null;
    currentRoomId.value = null;
    messages.value = [];
    isLoading.value = false;
    playerId.value = "";
    setGameRunning(false);
    inactivityNotified.value = false;

    if (heartbeatIntervalId.value) {
      workerClearInterval(heartbeatIntervalId.value);
      heartbeatIntervalId.value = null;
    }
    if (subscribeTimeoutId.value) {
      window.clearTimeout(subscribeTimeoutId.value);
      subscribeTimeoutId.value = null;
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
    if (document.visibilityState === "visible") return;
    handleInactivity();
  };

  const handleBeforeUnload = () => {
    handleInactivity({ skipNavigation: true });
  };

  const setChannel = (channel: any, roomId: string) => {
    activeChannel.value = channel;
    currentRoomId.value = roomId;
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

      if (!isHost.value && totalMembers <= 1) {
        console.error("Kein Host gefunden. Raum ist leer.");
        reset();
        isLoading.value = false;
        router.push("/");
        return;
      }

      const nextPlayers: Player[] = Object.keys(hash).map((id) => {
        if (hash[id].host && hash[id].rounds)
          configStore.maxRounds = hash[id].rounds;
        if (hash[id].host && hash[id].duration)
          configStore.revealTime = hash[id].duration;

        return {
          playerId: id,
          username: hash[id].name,
          avatarIndex: hash[id].avatar,
          isHost: hash[id].host,
          isOnline: true,
          points: 0,
          hasFinished: false,
          correctAnswers: 0,
        };
      });

      // Replace list to avoid stale/duplicate entries across reconnects.
      playersOnline.value = nextPlayers;

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
        isHost: member.user_info.host,
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
      if (isHost.value && onlineGameRunning.value) {
        channel.trigger("client-join-blocked", {
          targetId: member.user_id,
        });
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
    return roomId;
  };

  const joinSession = (userData: UserData, roomId: string) => {
    const clientInstance = createApinatorClient(userData);
    client.value = clientInstance;
    clientInstance.connect();

    const channelInstance = clientInstance.subscribe(
      `presence-pixreveal-${roomId}`,
    );

    setChannel(channelInstance, roomId);
    setupEvents(userData.playerId);
    startSubscribeTimeout();
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
    setGameRunning,
    hostSession,
    joinSession,
    sendChatMessage,
    removePlayer,
    reset,
  };
});
