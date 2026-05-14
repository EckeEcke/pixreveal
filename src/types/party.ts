export type BuzzerState = "open" | "locked" | "answering";

export type PartyPlayer = {
  playerId: string;
  username: string;
  avatarIndex: number;
  points: number;
};

export type PartyStatePayload = {
  sentAt: number;
  roundIndex: number;
  buzzerState: BuzzerState;
  activePlayerId: string | null;
  answerDeadlineAt: number | null;
  playerLastSeen?: Record<string, number>;
  players: PartyPlayer[];
  roundTimeLimit: number;
  buzzerTimeLimit: number;
};

