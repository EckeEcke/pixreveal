import { computed, ref, watch } from "vue";

const leaderTemplates = [
  "Move over! [New Leader] just took the lead!",
  "We have a new leader! All hail [New Leader]!",
  "Plot twist! [New Leader] is now on top!",
  "And just like that, [New Leader] steals the crown!",
] as const;

const leaderGapTemplates = [
  "Look at them go! [Player] is leaving everyone else in the dust!",
  "[Player] is on absolute fire! The gap is getting massive!",
  "Is anyone even trying to catch up? [Player] is playing in a league of their own right now!",
  "Unbelievable pace! [Player] is sprinting ahead and looking unstoppable!",
] as const;

export function useLeaderboardEvents(partyStore: any, gameStore: any) {
  const leaderTemplateIndex = ref(0);
  const leaderTemplate = ref<string | null>(null);
  const leaderNameUpper = ref<string>("PLAYER");
  const leaderMessageVisible = ref(false);
  let leaderHideTimeoutId: number | null = null;

  const clearLeaderHideTimeout = () => {
    if (!leaderHideTimeoutId) return;
    window.clearTimeout(leaderHideTimeoutId);
    leaderHideTimeoutId = null;
  };

  const partyPlayersByPoints = computed(() =>
    [...partyStore.players].sort(
      (a: any, b: any) => (b.points ?? 0) - (a.points ?? 0),
    ),
  );

  const leaderWatchSnapshot = computed(() =>
    partyPlayersByPoints.value.map((p: any) => ({
      playerId: p.playerId,
      username: p.username,
      points: p.points,
    })),
  );

  const leaderId = computed(
    () => leaderWatchSnapshot.value[0]?.playerId || null,
  );
  const leaderUsername = computed(
    () => leaderWatchSnapshot.value[0]?.username || null,
  );

  watch(
    leaderWatchSnapshot,
    (next, prev) => {
      const nextLeaderId = next?.[0]?.playerId;
      const prevLeaderId = prev?.[0]?.playerId;
      if (!nextLeaderId || nextLeaderId === prevLeaderId) return;

      const nextLeaderName = next?.[0]?.username || "Player";
      const template =
        leaderTemplates[leaderTemplateIndex.value % leaderTemplates.length] ??
        leaderTemplates[0];

      leaderTemplateIndex.value =
        (leaderTemplateIndex.value + 1) % leaderTemplates.length;
      leaderTemplate.value = template;
      leaderNameUpper.value = String(nextLeaderName).toUpperCase();
      leaderMessageVisible.value = true;

      clearLeaderHideTimeout();
      leaderHideTimeoutId = window.setTimeout(() => {
        leaderHideTimeoutId = null;
        leaderMessageVisible.value = false;
      }, 4000);
    },
    { deep: true },
  );

  const leaderMessageBefore = computed(
    () =>
      (leaderTemplate.value || leaderTemplates[0]).split("[New Leader]")[0] ||
      "",
  );
  const leaderMessageAfter = computed(
    () =>
      (leaderTemplate.value || leaderTemplates[0]).split("[New Leader]")[1] ||
      "",
  );

  const leaderGapTemplateIndex = ref(0);
  const leaderGapTemplate = ref<string | null>(null);
  let lastLeaderGapKey = "";

  const leaderGapActive = computed(() => {
    const first = partyPlayersByPoints.value[0];
    const second = partyPlayersByPoints.value[1];
    return Number(first?.points ?? 0) - Number(second?.points ?? 0) >= 3;
  });

  watch(
    [() => partyStore.buzzerState, leaderId, leaderGapActive],
    ([buzzerState, currentLeaderId, gapActive]) => {
      if (buzzerState !== "open" || !gapActive || !currentLeaderId) return;
      const key = `${currentLeaderId}|${gameStore.currentRoundIndex}`;
      if (key === lastLeaderGapKey) return;
      lastLeaderGapKey = key;

      const template =
        leaderGapTemplates[
          leaderGapTemplateIndex.value % leaderGapTemplates.length
        ] ?? leaderGapTemplates[0];
      leaderGapTemplateIndex.value =
        (leaderGapTemplateIndex.value + 1) % leaderGapTemplates.length;
      leaderGapTemplate.value = template;
    },
  );

  const leaderGapMessageBefore = computed(
    () =>
      (leaderGapTemplate.value || leaderGapTemplates[0]).split("[Player]")[0] ||
      "",
  );
  const leaderGapMessageAfter = computed(
    () =>
      (leaderGapTemplate.value || leaderGapTemplates[0]).split("[Player]")[1] ||
      "",
  );

  return {
    leaderNameUpper,
    leaderUsername,
    leaderMessageVisible,
    leaderMessageBefore,
    leaderMessageAfter,
    leaderGapActive,
    leaderGapMessageBefore,
    leaderGapMessageAfter,
  };
}
