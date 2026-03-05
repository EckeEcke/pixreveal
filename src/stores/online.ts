import { defineStore } from "pinia";
import { useGameStore } from "./game";
import { ref, shallowRef, watch } from "vue";
import { generateRoomId } from "@/utils/crypto";
import { createApinatorClient } from "@/services/apinator";
import { useRouter } from "vue-router";
import { usePlayerStore } from "./player";

export interface UserData {
  playerId: string;
  username: string;
  avatarIndex: number;
}

export interface Player extends UserData {
  isHost: boolean;
  points: number;
  hasFinished: boolean;
}

export const useOnlineStore = defineStore("online", () => {
  const playersOnline = ref<Player[]>([]);
  const activeChannel = shallowRef<any>(null);
  const client = shallowRef<any>(null);
  const currentRoomId = ref<string | null>(null);
  const playerId = ref("fuck this");
  const router = useRouter();
  const isHost = ref(false);
  const playerStore = usePlayerStore();

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
    playersOnline.value = playersOnline.value.filter(
      (p) => p.playerId !== playerId,
    );
  };

  const setupEvents = (myPlayerId: string) => {
    const channel = activeChannel.value;
    if (!channel) return;

    channel.bind("realtime:subscription_succeeded", (members: any) => {
      const hash = members.presence?.hash || {};

      Object.keys(hash).forEach((id) => {
        const remotePlayerData = {
          playerId: id,
          username: hash[id].name,
          avatarIndex: hash[id].avatar,
          isHost: id === myPlayerId ? isHost.value : false,
          points: 0,
          hasFinished: false,
        };

        const existing = playersOnline.value.find((p) => p.playerId === id);

        if (existing) {
          existing.username = remotePlayerData.username;
          existing.avatarIndex = remotePlayerData.avatarIndex;
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
        isHost: false,
        points: 0,
        hasFinished: false,
      });
    });

    channel.bind("realtime:member_removed", (member: any) => {
      removePlayer(member.user_id || member.id);
    });

    channel.bind("client-game-started", (data: any) => {
      useGameStore().prepareGame(data.rounds);
      router.push("/game");
    });

    channel.bind(
      "client-player-finished",
      (data: { playerId: string; points: number }) => {
        const player = playersOnline.value.find(
          (p) => p.playerId === data.playerId,
        );
        if (player) {
          player.points = data.points;
          player.hasFinished = true;
        }
      },
    );
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
      });
      router.push("/game");
    }
  };

  const broadcastScore = () => {
    const points = playerStore.points;
    if (activeChannel.value && client.value) {
      const me = playersOnline.value.find((p) => p.playerId === playerId.value);
      if (me) {
        me.points = points;
        me.hasFinished = true;
      }

      activeChannel.value.trigger("client-player-finished", {
        playerId: playerId.value,
        points: points,
      });
    }
  };

  const reset = () => {
    if (activeChannel.value) {
      activeChannel.value.unsubscribe();
    }
    playersOnline.value = [];
    activeChannel.value = null;
    client.value = null;
    currentRoomId.value = null;
  };

  watch(
    () => playersOnline.value.length,
    (newLength) => {
      console.log(`[DEBUG] Spieleranzahl geändert: ${newLength}`);
      console.log("Aktuelle Spieler:", JSON.stringify(playersOnline.value));
    },
  );

  return {
    playersOnline,
    activeChannel,
    currentRoomId,
    isHost,
    playerId,
    hostSession,
    joinSession,
    reset,
    removePlayer,
    triggerGameStart,
    broadcastScore,
  };
});
