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
  const bonusRoundType = computed<BonusRoundType | null>(() =>
    getBonusRoundType(opts.currentRoundIndex.value, opts.maxRounds.value),
  );

  const isFinalRound = computed(
    () => opts.currentRoundIndex.value === opts.maxRounds.value - 1,
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
    showFinalRoundTransition,
    showBonusRoundTransition,
    handleFinalRoundDone,
    handleBonusRoundDone,
    shouldShowTransitionOnRevealing,
  };
};
