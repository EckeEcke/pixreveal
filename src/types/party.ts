export type BuzzerState = "open" | "locked" | "answering";

export type PartyPlayer = {
  playerId: string;
  username: string;
  avatarIndex: number;
  points: number;
  wrongAnswers: number;
  correctAnswers: number;
  quickestAnswer: number | null;
  powerupsUsed: number;
  emojisSent: number;
  isDecrypter: boolean;
};

export type PartyStatePayload = {
  sentAt: number;
  roundIndex: number;
  buzzerState: BuzzerState;
  activePlayerId: string | null;
  answerDeadlineAt: number | null;
  lightsOutUntilAt?: number | null;
  lightsOutByPlayerId?: string | null;
  lightsOutUsedBy?: Record<string, boolean>;
  xlzActiveForRoundIndex?: number | null;
  xlzUsedBy?: Record<string, boolean>;
  freezeUntilAt?: number | null;
  freezeByPlayerId?: string | null;
  freezeUsedBy?: Record<string, boolean>;
  playerLastSeen?: Record<string, number>;
  players: PartyPlayer[];
  roundTimeLimit: number;
  buzzerTimeLimit: number;
};
