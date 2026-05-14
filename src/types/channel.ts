export interface UserData {
  playerId: string;
  username: string;
  avatarIndex: number;
  isHost: boolean;
  rounds?: number;
  revealTime?: number;
}

export interface Player {
  playerId: string;
  username: string;
  avatarIndex: number;
  isHost: boolean;
  isOnline: boolean;
  points: number;
  hasFinished: boolean;
  correctAnswers: number;
}

