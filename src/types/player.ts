import type { AvatarSpriteSheet } from "@/utils/avatar";
import type { PlayerNameEffect, PlayerAvatarEffect } from "@/data/unlockables";

export type OnlineHighlight = {
  roundIndex: number;
  pixels: number[][];
  givenAnswer: string;
  isCorrect: boolean;
  elapsedMs: number;
  visiblePixelCount: number;
};

export type OnlineAnswerSummary = Omit<OnlineHighlight, "pixels">;

export interface Player {
  playerId: string;
  username: string;
  avatarIndex: number;
  avatarSpriteSheet?: AvatarSpriteSheet;
  nameEffect?: PlayerNameEffect;
  avatarEffect?: PlayerAvatarEffect;
  isHost: boolean;
  isOnline: boolean;
  points: number;
  hasFinished: boolean;
  correctAnswers: number;
  answerHistory?: boolean[];
  onlineHighlights?: OnlineHighlight[];
  onlineAnswerSummaries?: OnlineAnswerSummary[];
  bestCorrectHighlight?: OnlineHighlight;
  worstIncorrectHighlight?: OnlineHighlight;
}
