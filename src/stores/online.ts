import { defineStore } from "pinia";
import { useGameStore } from "./game";
import { ref, shallowRef, watch } from "vue";
import { generateRoomId } from "@/utils/crypto";
import { createApinatorClient } from "@/services/apinator";
import { useRouter } from "vue-router";
import { usePlayerStore } from "./player";
import { useConfigStore } from "./config";

export interface UserData {
  playerId: string;
  username: string;
  avatarIndex: number;
  isHost: boolean;
}

export interface Player extends UserData {
  isHost: boolean;
  isOnline: boolean;
  points: number;
  hasFinished: boolean;
  correctAnswers: number;
}

export const useOnlineStore = defineStore("online", () => {
  const playersOnline = ref<Player[]>([]);
  const activeChannel = shallowRef<any>(null);
  const client = shallowRef<any>(null);
  const currentRoomId = ref<string | null>(null);
  const playerId = ref("");
  const router = useRouter();
  const isHost = ref(false);
  const playerStore = usePlayerStore();
  const configStore = useConfigStore();
  const messages = ref<any[]>([]);
  const isLoading = ref(false);
  const loadingText = ref("LOADING...");

  const unloadHandler = ref<(() => void) | null>(null);
  const visibilityHandler = ref<(() => void) | null>(null);

  const setChannel = (channel: any, roomId: string) => {
    activeChannel.value = channel;
    currentRoomId.value = roomId;
  };

  const addPlayer = (player: Player) => {
    if (!playersOnline.value.some((p) => p.playerId === player.playerId)) {
      playersOnline.value.push(player);
    }
  };

  const removePlayer = (playerId: string) => {
    const removedPlayer = playersOnline.value.find(
      (p) => p.playerId === playerId,
    );
    if (removedPlayer) removedPlayer.isOnline = false;
  };

  const setupEvents = (myPlayerId: string) => {
    const channel = activeChannel.value;
    if (!channel) return;

    unloadHandler.value = () => {
      channel.trigger("client-player-left", { playerId: myPlayerId });
    };
    window.addEventListener("beforeunload", unloadHandler.value);

    visibilityHandler.value = () => {
      if (document.visibilityState === "hidden") {
        channel.trigger("client-player-left", { playerId: myPlayerId });
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler.value);

    channel.bind("realtime:subscription_succeeded", (members: any) => {
      const hash = members.presence?.hash || {};
      const totalMembers = Object.keys(hash).length;

      if (!isHost.value && totalMembers <= 1) {
        console.error("Kein Host gefunden. Raum ist leer.");
        reset();
        isLoading.value = false;
        router.push("/");
        return;
      }

      Object.keys(hash).forEach((id) => {
        console.log(id, members);
        const remotePlayerData = {
          playerId: id,
          username: hash[id].name,
          avatarIndex: hash[id].avatar,
          isHost: hash[id].host,
          isOnline: true,
          points: 0,
          hasFinished: false,
          correctAnswers: 0,
        };

        if (hash[id].host && hash[id].rounds)
          configStore.maxRounds = hash[id].rounds;

        if (hash[id].host && hash[id].duration)
          configStore.revealTime = hash[id].duration;

        const existing = playersOnline.value.find((p) => p.playerId === id);

        if (existing) {
          existing.username = remotePlayerData.username;
          existing.avatarIndex = remotePlayerData.avatarIndex;
          existing.isOnline = true;
        } else {
          playersOnline.value.push(remotePlayerData);
        }
      });

      if (router.currentRoute.value.path === "/") {
        router.push("/lobby");
      }
    });

    channel.bind("realtime:member_added", (member: any) => {
      console.log("Member added event:", member);
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
    });

    channel.bind("realtime:member_removed", (member: any) => {
      removePlayer(member.user_id || member.id);
    });

    channel.bind("client-game-started", (data: any) => {
      useGameStore().prepareGame(data.revealTime, data.rounds);
      router.push("/game");
    });

    channel.bind(
      "client-player-finished",
      (data: { playerId: string; points: number; correctAnswers: number }) => {
        const player = playersOnline.value.find(
          (p) => p.playerId === data.playerId,
        );
        if (player) {
          player.points = data.points;
          player.hasFinished = true;
          player.correctAnswers = data.correctAnswers;
        }
      },
    );

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
    setupEvents(userData.playerId);

    isHost.value = true;
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
  };

  const triggerGameStart = () => {
    if (activeChannel.value) {
      activeChannel.value.trigger("client-game-started", {
        startedAt: new Date().toISOString(),
        rounds: useGameStore().rounds,
        maxRounds: useConfigStore().maxRounds,
        revealTime: useGameStore().revealTime,
      });
      router.push("/game");
    }
  };

  const broadcastScore = () => {
    const points = playerStore.points;
    const correctAnswers = playerStore.correctAnswers;
    console.log("triggered game finished", activeChannel.value, client.value);
    if (activeChannel.value && client.value) {
      const me = playersOnline.value.find((p) => p.playerId === playerId.value);
      if (me) {
        me.points = points;
        me.hasFinished = true;
        me.correctAnswers = correctAnswers;
      }

      activeChannel.value.trigger("client-player-finished", {
        playerId: playerId.value,
        points: points,
        correctAnswers: correctAnswers,
      });
    }
  };

  const sendChatMessage = (text: string) => {
    if (!activeChannel.value || text.trim() === "") return;

    const messageData = {
      id: `${playerId.value}-${Date.now()}`,
      playerId: playerId.value,
      username: playerStore.playerName,
      text: text,
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

  const reset = () => {
    if (client.value && currentRoomId.value) {
      client.value.unsubscribe(`presence-pixreveal-${currentRoomId.value}`);
    }
    playersOnline.value = [];
    activeChannel.value = null;
    client.value = null;
    currentRoomId.value = null;
    messages.value = [];
    isLoading.value = false;

    if (unloadHandler.value) {
      window.removeEventListener("beforeunload", unloadHandler.value);
      unloadHandler.value = null;
    }
    if (visibilityHandler.value) {
      document.removeEventListener("visibilitychange", visibilityHandler.value);
      visibilityHandler.value = null;
    }
  };

  watch(
    () => playersOnline.value.length,
    (newLength) => {
      console.log(`[DEBUG] Player count changed: ${newLength}`);
      console.log("Current players:", JSON.stringify(playersOnline.value));
    },
  );

  return {
    playersOnline,
    activeChannel,
    currentRoomId,
    isHost,
    playerId,
    messages,
    isLoading,
    loadingText,
    hostSession,
    joinSession,
    reset,
    removePlayer,
    triggerGameStart,
    broadcastScore,
    sendChatMessage,
  };
});
