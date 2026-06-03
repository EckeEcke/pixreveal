import { toast } from "vue3-toastify";
import { isHostFlag } from "@/utils/realtime";
import {
  MAX_PLAYERS_REGULAR,
  MAX_PLAYERS_PARTY_NON_HOST,
} from "@/stores/channel.constants";
import type { Ref } from "vue";
import type { Router } from "vue-router";
import type { Player } from "@/types/channel";

interface RawMember {
  user_id: string;
  user_info: {
    name: string;
    avatar: number;
    host: string | boolean | number;
  };
}

interface ChatMessage {
  id: string;
  username: string;
  text: string;
  isSystem: boolean;
  timestamp?: string;
}

interface PlayerManagement {
  playersOnline: Ref<Player[]>;
  addPlayer(player: Player): void;
  removePlayer(playerId: string): void;
  allowRejoinDuringRunningGame(playerId: string): void;
  allowedIdsDuringGame: Ref<Set<string> | null>;
}

interface LoadingState {
  isReconnecting: boolean;
  clear(): void;
}

export interface UseMemberEventsOptions {
  channel: any;
  isHost: Ref<boolean>;
  mode: Ref<"regular" | "party">;
  playerId: Ref<string>;
  onlineGameRunning: Ref<boolean>;
  noHostGraceTimeoutId: Ref<number | null>;
  messages: Ref<ChatMessage[]>;
  playerMgmt: PlayerManagement;
  loading: LoadingState;
  router: Router;
  reset(): void;
}

export function buildPlayerFromMember(member: RawMember): Player {
  return {
    playerId: member.user_id,
    username: member.user_info.name,
    avatarIndex: member.user_info.avatar,
    isHost: isHostFlag(member.user_info.host),
    isOnline: true,
    points: 0,
    hasFinished: false,
    correctAnswers: 0,
  };
}

export function buildJoinMessage(member: RawMember): ChatMessage {
  return {
    id: `sys-${Date.now()}`,
    username: "System",
    text: `${member.user_info.name} joined the lobby`,
    isSystem: true,
  };
}

export function isLobbyOverCapacityAfterJoin(
  playersOnline: Player[],
  mode: "regular" | "party",
): boolean {
  if (mode === "party") {
    const nonHostCount = playersOnline.filter((p) => !p.isHost).length;
    return nonHostCount > MAX_PLAYERS_PARTY_NON_HOST;
  }
  return playersOnline.length > MAX_PLAYERS_REGULAR;
}

export function useMemberEvents({
  channel,
  isHost,
  mode,
  playerId,
  onlineGameRunning,
  noHostGraceTimeoutId,
  messages,
  playerMgmt,
  loading,
  router,
  reset,
}: UseMemberEventsOptions): void {
  channel.bind("realtime:member_added", (member: RawMember) => {
    const player = buildPlayerFromMember(member);
    playerMgmt.addPlayer(player);
    messages.value.push(buildJoinMessage(member));

    if (!isHost.value && player.isHost && noHostGraceTimeoutId.value !== null) {
      window.clearTimeout(noHostGraceTimeoutId.value);
      noHostGraceTimeoutId.value = null;
      if (loading.isReconnecting) loading.clear();
    }

    if (isHost.value && onlineGameRunning.value) {
      playerMgmt.allowRejoinDuringRunningGame(member.user_id);

      const isBlocked =
        playerMgmt.allowedIdsDuringGame.value !== null &&
        !playerMgmt.allowedIdsDuringGame.value.has(member.user_id);

      if (isBlocked) {
        channel.trigger("client-join-blocked", { targetId: member.user_id });
      }
    }

    if (isHost.value && !onlineGameRunning.value) {
      if (
        isLobbyOverCapacityAfterJoin(playerMgmt.playersOnline.value, mode.value)
      ) {
        channel.trigger("client-join-blocked", { targetId: member.user_id });
      }
    }
  });

  channel.bind("realtime:member_removed", (member: any) => {
    const id: string = member.user_id ?? member.id;
    playerMgmt.removePlayer(id);
  });

  channel.bind("client-join-blocked", (data: { targetId?: string }) => {
    if (!data?.targetId || String(data.targetId) !== playerId.value) return;
    toast.error("Room is already full");
    reset();
    router.push("/");
  });
}
