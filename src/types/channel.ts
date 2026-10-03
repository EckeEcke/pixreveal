import type { AvatarSpriteSheet } from "@/utils/avatar";

export interface UserData {
  playerId: string;
  username: string;
  avatarIndex: number;
  avatarSpriteSheet?: AvatarSpriteSheet;
  isHost: boolean;
  rounds?: number;
  revealTime?: number;
}

