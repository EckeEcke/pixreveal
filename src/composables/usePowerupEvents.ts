import { computed, ref, watch } from "vue";

const freezeTemplates = [
  "STONE COLD! [Player] used the freeze powerup.",
  "ICE ICE BABY! [Player] hit the freeze powerup.",
  "BRRR... [Player] just froze everyone.",
  "CHILL OUT! [Player] triggered freeze.",
] as const;

const darkenTemplates = [
  "WHAT?! I CAN'T SEE! Oh.. [Player] turned the lights off",
  "BLACKOUT! [Player] just killed the lights",
  "DID THE LIGHTS JUST GO OUT? [Player] did that",
  "NO LIGHTS, NO MERCY. [Player] flipped the switch",
] as const;

export function usePowerupEvents(partyStore: any) {
  const findUsernameById = (playerId: string | null) => {
    if (!playerId) return null;
    return (
      partyStore.players.find((p: any) => p.playerId === playerId)?.username ||
      null
    );
  };

  // Freeze Logik
  const isFreezeActive = computed(
    () => typeof partyStore.freezeUntilAt === "number",
  );
  const freezeTemplateIndex = ref(0);
  const freezeTemplate = ref<string | null>(null);
  let lastFreezeUntilAt: number | null = null;

  watch(
    () => partyStore.freezeUntilAt,
    (untilAt) => {
      if (
        typeof untilAt !== "number" ||
        untilAt <= Date.now() ||
        lastFreezeUntilAt === untilAt
      ) {
        if (typeof untilAt !== "number") lastFreezeUntilAt = null;
        return;
      }
      lastFreezeUntilAt = untilAt;
      const template =
        freezeTemplates[freezeTemplateIndex.value % freezeTemplates.length] ??
        freezeTemplates[0];
      freezeTemplateIndex.value =
        (freezeTemplateIndex.value + 1) % freezeTemplates.length;
      freezeTemplate.value = template;
    },
  );

  const freezeMessageBefore = computed(
    () =>
      (freezeTemplate.value || freezeTemplates[0]).split("[Player]")[0] || "",
  );
  const freezeMessageAfter = computed(
    () =>
      (freezeTemplate.value || freezeTemplates[0]).split("[Player]")[1] || "",
  );
  const freezeActorNameUpper = computed(() =>
    (findUsernameById(partyStore.freezeByPlayerId) || "HOST").toUpperCase(),
  );

  // Darken logic
  const darkenTemplateIndex = ref(0);
  const darkenTemplate = ref<string | null>(null);
  let lastDarkenUntilAt: number | null = null;

  watch(
    () => partyStore.darkenUntilAt as number | null | undefined,
    (untilAt) => {
      if (
        typeof untilAt !== "number" ||
        untilAt <= Date.now() ||
        lastDarkenUntilAt === untilAt
      ) {
        if (typeof untilAt !== "number") lastDarkenUntilAt = null;
        return;
      }
      lastDarkenUntilAt = untilAt;
      const template =
        darkenTemplates[
          darkenTemplateIndex.value % darkenTemplates.length
        ] ?? darkenTemplates[0];
      darkenTemplateIndex.value =
        (darkenTemplateIndex.value + 1) % darkenTemplates.length;
      darkenTemplate.value = template;
    },
  );

  const darkenMessageBefore = computed(
    () =>
      (darkenTemplate.value || darkenTemplates[0]).split("[Player]")[0] ||
      "",
  );
  const darkenMessageAfter = computed(
    () =>
      (darkenTemplate.value || darkenTemplates[0]).split("[Player]")[1] ||
      "",
  );
  const darkenActorNameUpper = computed(() =>
    (
      findUsernameById(partyStore.darkenByPlayerId || null) || "HOST"
    ).toUpperCase(),
  );

  return {
    isFreezeActive,
    freezeMessageBefore,
    freezeMessageAfter,
    freezeActorNameUpper,
    darkenMessageBefore,
    darkenMessageAfter,
    darkenActorNameUpper,
  };
}
