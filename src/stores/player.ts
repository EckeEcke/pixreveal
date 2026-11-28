import { ref, type Ref, watch } from "vue";
import { defineStore } from "pinia";
import { getRandomUserName } from "@/utils/random";
import { useConfigStore } from "./config";
import { generatePlayerId } from "@/utils/crypto";
import type { OnlineAnswerSummary, OnlineHighlight } from "@/types/player";
import { selectOnlineHighlightCandidates, summarizeOnlineAnswers } from "@/utils/onlineHighlights";
import type { AvatarSpriteSheet } from "@/utils/avatar";
import { NAME_EFFECTS, AVATAR_EFFECTS, type PlayerNameEffect, type PlayerAvatarEffect } from "@/data/unlockables";
import { useAchievementsStore } from "@/stores/achievements";

const STORAGE_KEY = "pixreveal:playerProfile";
const CONTROLLER_ID_KEY = "pixreveal:controllerId";

export const usePlayerStore = defineStore("player", () => {
  const savedProfile = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  const savedControllerId = sessionStorage.getItem(CONTROLLER_ID_KEY) || "";

  const controllerId: Ref<string> = ref(savedControllerId);
  if (!controllerId.value) {
    controllerId.value = crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
    sessionStorage.setItem(CONTROLLER_ID_KEY, controllerId.value);
  }

  const playerId: Ref<string> = ref(savedProfile.id || "");
  if (!playerId.value) {
    playerId.value = generatePlayerId();
  }

  const playerName: Ref<string> = ref(savedProfile.name || "");
  const avatarIndex: Ref<number> = ref(savedProfile.avatar ?? 0);
  const avatarSpriteSheet: Ref<AvatarSpriteSheet> = ref(
    savedProfile.spriteSheet === "unlockables" ? "unlockables" : "classic",
  );
  const playerNameEffect: Ref<PlayerNameEffect> = ref(
      NAME_EFFECTS.some((effect) => effect.id === savedProfile.nameEffect)
      ? savedProfile.nameEffect
      : "none",
  );
  const playerAvatarEffect: Ref<PlayerAvatarEffect> = ref(
      AVATAR_EFFECTS.some((effect) => effect.id === savedProfile.avatarEffect)
      ? savedProfile.avatarEffect
      : "none",
  );
  const points: Ref<number> = ref(0);
  const correctAnswers = ref(0);
  const answerHistory: Ref<boolean[]> = ref([]);
  const onlineHighlights = ref<OnlineHighlight[]>([]);
  const onlineAnswerSummaries = ref<OnlineAnswerSummary[]>([]);
  const gameMode = ref<
    "classic" | "inspect" | "gravity" | "survival" | string
  >("classic");
  const isCreatorMode: Ref<boolean> = ref(false);

  const achievementsStore = useAchievementsStore();
  void achievementsStore.loadAchievements().then(() => {
    if (!achievementsStore.hasBonusAvatars && avatarSpriteSheet.value === "unlockables") {
      avatarSpriteSheet.value = "classic";
    }
  });

  watch(
      [playerName, avatarIndex, playerId, avatarSpriteSheet, playerNameEffect, playerAvatarEffect],
      ([newName, newAvatar, newId, newSpriteSheet, newNameEffect, newAvatarEffect]) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        name: newName,
        avatar: newAvatar,
        id: newId,
        spriteSheet: newSpriteSheet,
        nameEffect: newNameEffect,
        avatarEffect: newAvatarEffect,
      }),
    );
    },
    { immediate: true },
  );

  const setUser = (user: { username: string; avatar: number }) => {
    setPlayerName(user.username);
    setAvatar(user.avatar);
    points.value = 0;
    correctAnswers.value = 0;
    answerHistory.value = [];
    onlineHighlights.value = [];
    onlineAnswerSummaries.value = [];
  };

  const setPlayerName = (newName: string) => {
    playerName.value =
      newName.trim().length > 0
        ? newName
        : playerName.value || getRandomUserName();
  };

  const setAvatar = (newIndex: number) => {
    avatarIndex.value = newIndex ?? 0;
  };

  const setSheet = (newSheet: AvatarSpriteSheet) => {
    if (newSheet === "unlockables" && !achievementsStore.hasBonusAvatars) return;
    avatarSpriteSheet.value = newSheet;
  };

  const setPlayerNameEffect = (effect: PlayerNameEffect) => {
    if (effect !== "none") {
      const reward = NAME_EFFECTS.find((item) => item.id === effect);
      if (!reward || achievementsStore.cosmeticProgress < reward.unlockAt) return;
    }
    playerNameEffect.value = effect;
  };

  const setPlayerAvatarEffect = (effect: PlayerAvatarEffect) => {
    if (effect !== "none") {
      const reward = AVATAR_EFFECTS.find((item) => item.id === effect);
      if (!reward || achievementsStore.cosmeticProgress < reward.unlockAt) return;
    }
    playerAvatarEffect.value = effect;
  };

  const addPoints = (earnedPoints: number) => {
    const pointsToAdd = Math.min(earnedPoints, useConfigStore().revealTime);
    points.value += pointsToAdd;
    if (earnedPoints > 0) correctAnswers.value++;
  };

  const pushToAnswerHistory = (isCorrect: boolean) => {
    answerHistory.value.push(isCorrect);
  }

  const recordHighlight = (highlight: OnlineHighlight) => {
    onlineAnswerSummaries.value = summarizeOnlineAnswers([...onlineAnswerSummaries.value, highlight]);
    onlineHighlights.value = selectOnlineHighlightCandidates([...onlineHighlights.value, highlight]);
  }

  return {
    controllerId,
    playerId,
    playerName,
    avatarIndex,
    avatarSpriteSheet,
    playerNameEffect,
    playerAvatarEffect,
    points,
    correctAnswers,
    gameMode,
    isCreatorMode,
    answerHistory,
    onlineHighlights,
    onlineAnswerSummaries,
    setUser,
    setAvatar,
    setSheet,
    setPlayerNameEffect,
    setPlayerAvatarEffect,
    addPoints,
    pushToAnswerHistory,
    recordHighlight,
  };
});
