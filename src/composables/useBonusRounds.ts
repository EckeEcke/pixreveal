import { computed, ref } from "vue";
import type { ComputedRef, Ref } from "vue";
import { getBonusRoundType, type BonusRoundType } from "@/types/bonusRound";

type GameStateLike = string;

export type UseBonusRoundsOptions = {
  currentRoundIndex: Ref<number> | ComputedRef<number>;
  maxRounds: Ref<number> | ComputedRef<number>;
  gameState: Ref<GameStateLike> | ComputedRef<GameStateLike>;
  timer: Ref<number>;
  timerDuration: Ref<number> | ComputedRef<number>;
  baseRevealing: Ref<boolean> | ComputedRef<boolean>;
  blurActiveStates?: ReadonlyArray<GameStateLike>;
  blurTimeLeft?: Ref<number> | ComputedRef<number>;
};

export const useBonusRounds = (opts: UseBonusRoundsOptions) => {
  const blurActiveStates = computed(() =>
    (opts.blurActiveStates?.length ? opts.blurActiveStates : ["revealing"]) as GameStateLike[],
  );

  const bonusRoundType = computed<BonusRoundType | null>(() =>
    getBonusRoundType(opts.currentRoundIndex.value, opts.maxRounds.value),
  );

  const isFinalRound = computed(
    () => opts.currentRoundIndex.value === opts.maxRounds.value - 1,
  );

  const isBlurRoundActive = computed(() => {
    if (bonusRoundType.value !== "blur") return false;
    return blurActiveStates.value.includes(opts.gameState.value);
  });

  const blurAmountPx = computed(() => {
    if (!isBlurRoundActive.value) return 0;
    const duration = opts.timerDuration.value || 1;
    const source = opts.blurTimeLeft ?? opts.timer;
    const t = typeof source.value === "number" ? source.value : duration;
    const ratio = Math.min(1, Math.max(0, t / duration));
    const maxBlur = 80;
    return maxBlur * ratio;
  });

  const canvasEffectsStyle = computed(() => {
    if (!bonusRoundType.value) return { filter: "none" };

    // Only keep effects while the round is actively being revealed/answered.
    // After answering (feedback/revealed), the UI should fade back to normal.
    const effectsActive =
      opts.baseRevealing.value ||
      (bonusRoundType.value === "blur" && isBlurRoundActive.value);
    if (!effectsActive) return { filter: "none" };

    const filters: string[] = [];
    if (bonusRoundType.value === "blur") {
      filters.push(`blur(${blurAmountPx.value}px)`);
    }
    if (bonusRoundType.value === "sepia") {
      filters.push("sepia(0.7)");
      filters.push("saturate(1.2)");
    }
    if (bonusRoundType.value === "bw") {
      filters.push("grayscale(0.7)");
      filters.push("contrast(1.15)");
    }
    return { filter: filters.join(" ") || "none" };
  });

  const canvasIsRevealing = computed(() =>
    Boolean(opts.baseRevealing.value && bonusRoundType.value !== "blur"),
  );

  const showFinalRoundTransition = ref(false);
  const finalRoundTransitionShown = ref(false);
  const showBonusRoundTransition = ref(false);
  const bonusRoundTransitionShownByIndex = ref<Record<number, boolean>>({});

  const handleFinalRoundDone = () => {
    finalRoundTransitionShown.value = true;
    showFinalRoundTransition.value = false;
  };

  const handleBonusRoundDone = () => {
    const idx = opts.currentRoundIndex.value;
    bonusRoundTransitionShownByIndex.value = {
      ...bonusRoundTransitionShownByIndex.value,
      [idx]: true,
    };
    showBonusRoundTransition.value = false;
  };

  const shouldShowTransitionOnRevealing = () => {
    if (isFinalRound.value && !finalRoundTransitionShown.value) return "final" as const;
    const idx = opts.currentRoundIndex.value;
    if (bonusRoundType.value && !bonusRoundTransitionShownByIndex.value[idx]) return "bonus" as const;
    return null;
  };

  return {
    bonusRoundType,
    isFinalRound,
    isBlurRoundActive,
    blurAmountPx,
    canvasEffectsStyle,
    canvasIsRevealing,
    showFinalRoundTransition,
    showBonusRoundTransition,
    handleFinalRoundDone,
    handleBonusRoundDone,
    shouldShowTransitionOnRevealing,
  };
};
