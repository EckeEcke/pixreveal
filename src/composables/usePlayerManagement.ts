import { ref } from "vue";
import { readAllowedIds, writeAllowedIds } from "@/services/channelPersistence";
import type { Player } from "@/types/player";

type PlayerManagementCallbacks = {
  getIsHost: () => boolean;
  getGameRunning: () => boolean;
  getPlayerId: () => string;
  getCurrentRoomId: () => string | null;
};

export function usePlayerManagement({
  getIsHost,
  getGameRunning,
  getPlayerId,
  getCurrentRoomId,
}: PlayerManagementCallbacks) {
  const playersOnline = ref<Player[]>([]);
  const allowedIdsDuringGame = ref<Set<string> | null>(null);

  const addPlayer = (player: Player) => {
    if (!playersOnline.value.some((p: Player) => p.playerId === player.playerId)) {
      playersOnline.value.push(player);
    }
  };

  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    const player = playersOnline.value.find((p) => p.playerId === playerId);
    if (player) Object.assign(player, updates);
  };

  const removePlayer = (id: string) => {
    playersOnline.value = playersOnline.value.filter((p: Player) => p.playerId !== id);
  };

  const lockAllowedIdsForRunningGame = () => {
    if (!getIsHost() || !getGameRunning()) return;
    const ids = new Set(playersOnline.value.map((p: Player) => p.playerId));
    if (getPlayerId()) ids.add(getPlayerId());
    allowedIdsDuringGame.value = ids;
    const roomId = getCurrentRoomId();
    if (roomId) writeAllowedIds(roomId, ids);
  };

  const allowRejoinDuringRunningGame = (id: string) => {
    if (!getIsHost() || !getGameRunning()) return;
    if (!allowedIdsDuringGame.value) {
      allowedIdsDuringGame.value = new Set<string>();
    }
    allowedIdsDuringGame.value.add(id);
    const roomId = getCurrentRoomId();
    if (roomId) writeAllowedIds(roomId, allowedIdsDuringGame.value);
  };

  const rehydrateAllowedIds = () => {
    const roomId = getCurrentRoomId();
    if (!roomId) return;
    const persistedAllow = readAllowedIds(roomId);
    if (persistedAllow) {
      if (!allowedIdsDuringGame.value) {
        allowedIdsDuringGame.value = persistedAllow;
      } else {
        persistedAllow.forEach((id) => allowedIdsDuringGame.value?.add(id));
      }
      writeAllowedIds(roomId, allowedIdsDuringGame.value);
    } else {
      lockAllowedIdsForRunningGame();
    }
  };

  const reset = (clearPersistedRoom?: string | null) => {
    playersOnline.value = [];
    allowedIdsDuringGame.value = null;
    if (clearPersistedRoom) {
      writeAllowedIds(clearPersistedRoom, null);
    }
  };

  return {
    playersOnline,
    allowedIdsDuringGame,
    addPlayer,
    updatePlayer,
    removePlayer,
    lockAllowedIdsForRunningGame,
    allowRejoinDuringRunningGame,
    rehydrateAllowedIds,
    reset,
  };
}
