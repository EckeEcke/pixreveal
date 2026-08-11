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

export type PartyPlayerStats = {
  playerId: string;
  username: string;
  avatarIndex: number;
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
  xlzCharges?: number;
  xlzByPlayerId?: string | null;
  xlzUsedBy?: Record<string, boolean>;
  devilCharges?: number;
  devilByPlayerId?: string | null;
  devilUsedBy?: Record<string, boolean>;
  freezeUntilAt?: number | null;
  freezeByPlayerId?: string | null;
  freezeUsedBy?: Record<string, boolean>;
  upsideDownUntilAt?: number | null;
  upsideDownByPlayerId?: string | null;
  upsideDownUsedBy?: Record<string, boolean>;
  fartCharges?: number;
  fartByPlayerId?: string | null;
  fartUsedBy?: Record<string, boolean>;
  playerLastSeen?: Record<string, number>;
  players: PartyPlayer[];
  roundTimeLimit: number;
  buzzerTimeLimit: number;
  isSuddenDeath?: boolean;
  suddenDeathPlayerIds?: string[];
  buzzTransitionPending?: boolean;
  buzzedPlayerIds?: string[];
};