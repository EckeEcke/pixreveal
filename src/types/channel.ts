import type { AvatarSpriteSheet } from "@/utils/avatar";
import type { PlayerNameEffect, PlayerAvatarEffect } from "@/data/unlockables";

export interface UserData {
  playerId: string;
  username: string;
  avatarIndex: number;
  avatarSpriteSheet?: AvatarSpriteSheet;
  nameEffect?: PlayerNameEffect;
  avatarEffect?: PlayerAvatarEffect;
  isHost: boolean;
  rounds?: number;
  revealTime?: number;
}

