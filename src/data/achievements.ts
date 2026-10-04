export type AchievementId =
  | "edit-player"
  | "play-singleplayer"
  | "survivor"
  | "perfect-round"
  | "play-daily"
  | "create-challenge"
  | "win-challenge"
  | "play-party"
  | "play-online"
  | "win-party"
  | "win-online"
  | "completionist";

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "edit-player",
    title: "Edit Player",
    description: "Change your name and avatar.",
    icon: "🎭",
  },
  {
    id: "play-singleplayer",
    title: "Welcome to PixReveal",
    description: "Play a game in any singleplayer mode.",
    icon: "👋",
  },
  {
    id: "survivor",
    title: "Survivor",
    description: "Reach a Survival highscore of at least 20.",
    icon: "💀",
  },
  {
    id: "perfect-round",
    title: "Perfect Round",
    description: "Answer every question correctly in a singleplayer game.",
    icon: "💯",
  },
  {
    id: "play-daily",
    title: "Daily Challenger",
    description: "Play the Daily Challenge.",
    icon: "📅",
  },
  {
    id: "create-challenge",
    title: "Challenge a friend",
    description: "Create a challenge link to share with a friend.",
    icon: "⚔️",
  },
  {
    id: "win-challenge",
    title: "Win a Friend Challenge",
    description: "Finish a friend challenge with a higher score than your opponent.",
    icon: "💪",
  },
  {
    id: "play-party",
    title: "Party Gamer",
    description: "Play a Party match as a player.",
    icon: "🎉",
  },
  {
    id: "play-online",
    title: "Online Gamer",
    description: "Play an Online match.",
    icon: "🌐",
  },
  {
    id: "win-party",
    title: "Win a Party Game",
    description: "Finish a Party game in first place.",
    icon: "🏆",
  },
  {
    id: "win-online",
    title: "Win an Online Game",
    description: "Finish an Online game in first place.",
    icon: "👑",
  },
  {
    id: "completionist",
    title: "Completionist",
    description: "Unlock all achievements.",
    icon: "🏁",
  },
];