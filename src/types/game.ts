type PixelGrid = number[][];

export type Drawing = {
  name: string;
  category: string;
  data: PixelGrid;
  primaryColor: number;
  options?: RoundOption[];
};

export type RoundOption = {
  title: string;
  isCorrect: boolean;
};

export type Round = {
  answer: string;
  data: PixelGrid;
  options: RoundOption[];
};

export type GameState =
  | "starting"
  | "revealing"
  | "answering"
  | "feedback"
  | "revealed"
  | "gameover";