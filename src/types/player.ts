export type OnlineHighlight = {
  roundIndex: number;
  pixels: number[][];
  givenAnswer: string;
  isCorrect: boolean;
  elapsedMs: number;
  visiblePixelCount: number;
};

export interface Player {
  playerId: string;
  username: string;
  avatarIndex: number;
  isHost: boolean;
  isOnline: boolean;
  points: number;
  hasFinished: boolean;
  correctAnswers: number;
  answerHistory?: boolean[];
  onlineHighlights?: OnlineHighlight[];
  bestCorrectHighlight?: OnlineHighlight;
  worstIncorrectHighlight?: OnlineHighlight;
}
