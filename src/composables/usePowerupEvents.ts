import { computed, ref, watch } from "vue";

const freezeTemplates = [
  "STONE COLD! [Player] used the freeze powerup.",
  "ICE ICE BABY! [Player] hit the freeze powerup.",
  "BRRR... [Player] just froze everyone.",
  "CHILL OUT! [Player] triggered freeze.",
] as const;

const lightsOutTemplates = [
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

  // Lights Out Logik
  const lightsOutTemplateIndex = ref(0);
  const lightsOutTemplate = ref<string | null>(null);
  let lastLightsOutUntilAt: number | null = null;

  watch(
    () => partyStore.lightsOutUntilAt as number | null | undefined,
    (untilAt) => {
      if (
        typeof untilAt !== "number" ||
        untilAt <= Date.now() ||
        lastLightsOutUntilAt === untilAt
      ) {
        if (typeof untilAt !== "number") lastLightsOutUntilAt = null;
        return;
      }
      lastLightsOutUntilAt = untilAt;
      const template =
        lightsOutTemplates[
          lightsOutTemplateIndex.value % lightsOutTemplates.length
        ] ?? lightsOutTemplates[0];
      lightsOutTemplateIndex.value =
        (lightsOutTemplateIndex.value + 1) % lightsOutTemplates.length;
      lightsOutTemplate.value = template;
    },
  );

  const lightsOutMessageBefore = computed(
    () =>
      (lightsOutTemplate.value || lightsOutTemplates[0]).split("[Player]")[0] ||
      "",
  );
  const lightsOutMessageAfter = computed(
    () =>
      (lightsOutTemplate.value || lightsOutTemplates[0]).split("[Player]")[1] ||
      "",
  );
  const lightsOutActorNameUpper = computed(() =>
    (
      findUsernameById(partyStore.lightsOutByPlayerId || null) || "HOST"
    ).toUpperCase(),
  );

  return {
    isFreezeActive,
    freezeMessageBefore,
    freezeMessageAfter,
    freezeActorNameUpper,
    lightsOutMessageBefore,
    lightsOutMessageAfter,
    lightsOutActorNameUpper,
  };
}
