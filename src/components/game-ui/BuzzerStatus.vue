<template>
  <div class="buzzer-status">
    <RobotModerator />
    <div>
      <Transition name="fade" mode="out-in">
	        <div
	          v-if="partyStore.buzzerState === 'open'"
	          key="open"
	          class="status-pill open"
	        >
		          <template v-if="isFinalRound">
		            FINAL ROUND!
		            <br />
		            <span class="green-text">Double the points</span>, <span class="red-text">double the loss</span>!
		          </template>
		          <template v-else-if="isBonusRound">
		            BONUS ROUND!
		            <br />
		            <span class="green-text">Double the points</span>, <span class="red-text">double the loss</span>!
		          </template>
		          <template v-else>
                <template v-if="leaderGapActive">
                  {{ leaderGapMessageBefore }}
                  <span class="player-highlight">{{ leaderUsername?.toUpperCase?.() || "PLAYER" }}</span>
                  {{ leaderGapMessageAfter }}
                </template>
                <template v-else>
                  {{ openPrompt.line1 }}
                  <br />
                  {{ openPrompt.line2Before
                  }}<span class="pink-text">BUZZ</span>{{ openPrompt.line2After }}
                </template>
		          </template>
	        </div>

        <div
          v-else-if="partyStore.buzzerState === 'answering'"
          key="answering"
          class="status-pill answering"
        >
          <span class="waiting-player">{{ activePlayerName }}</span>
          hit the buzzer! Is it
          <span
            v-for="(opt, index) in optionsForPrompt"
            :key="`${index}-${opt}`"
            class="prompt-option"
            :style="{
              '--opt-color': getOptionStyle(index)['--opt-color'],
              '--opt-glow': getOptionStyle(index)['--opt-glow'],
            }"
          >
            {{ opt }}{{ index < optionsForPrompt.length - 2 ? ", " : "" }}
            <span v-if="index === optionsForPrompt.length - 2">
              &nbsp;<span class="white-text">or</span>&nbsp;
            </span>
	          <span v-else-if="index === optionsForPrompt.length - 1">?</span>
	        </span>
          <span v-if="partyStore.isXlzActive">&nbsp;Hmm.. this looks off.</span>
	      </div>

        <div
          v-else-if="
            partyStore.roundResult && gameStore.gameState !== 'revealing'
          "
          key="result"
          class="status-pill result"
          :class="resultClass"
        >
          <template v-if="!partyStore.activePlayerId">
            Time up! Nobody answered.
            <span class="answer-highlight">{{
              gameStore.currentRound?.answer
            }}</span>
            was the answer.
          </template>

          <template v-else-if="partyStore.roundResult === 'correct'">
            ✓ CORRECT!
            <span class="answer-highlight">{{
              gameStore.currentRound?.answer
            }}</span>
            was the answer.
            <br />
	            {{ pointsForCorrect }} point<span v-if="pointsForCorrect !== 1">s</span> for
	            <span class="player-highlight">{{ activePlayerNameUpper }}</span
	            >.
          </template>

          <template v-else>
            ✗ WRONG! The correct answer was
            <span class="answer-highlight">{{
              gameStore.currentRound?.answer
            }}</span
            >.
	            <span class="player-highlight">{{ activePlayerName }}</span> loses
	            {{ pointsForWrong }} points.
	          </template>
	        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="leaderMessageVisible" class="leader-text">
          {{ leaderMessageBefore }}
          <span class="player-highlight">{{ leaderNameUpper }}</span>
          {{ leaderMessageAfter }}
        </div>
      </Transition>

      <Transition name="fade">
        <div v-if="partyStore.isLightsOut" class="powerup-text">
          {{ lightsOutMessageBefore }}
          <span class="player-highlight">{{ lightsOutActorNameUpper }}</span>
          {{ lightsOutMessageAfter }}
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="isFreezeActive" class="powerup-text">
            {{ freezeMessageBefore }}
            <span class="player-highlight">{{ freezeActorNameUpper }}</span>
            {{ freezeMessageAfter }}
          </div>
        </Transition>
	    </div>
	  </div>
	</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { usePartyStore } from "@/stores/party";
import { useGameStore } from "@/stores/game";
import RobotModerator from "./RobotModerator.vue";
import type { BonusRoundType } from "@/types/bonusRound";

const props = defineProps<{
  isFinalRound?: boolean;
  bonusRoundType?: BonusRoundType | null;
}>();

const gameStore = useGameStore();
const partyStore = usePartyStore();

const activePlayerName = computed(
  () => partyStore.activePlayer?.username || "Player",
);

const activePlayerNameUpper = computed(() =>
  activePlayerName.value.toUpperCase(),
);

const openPromptTemplates = [
  {
    line1: "THINK YOU KNOW THE ANSWER?",
    line2Before: "HIT THE ",
    line2After: "!",
  },
  {
    line1: "READY TO MAKE A GUESS?",
    line2Before: "SMASH THE ",
    line2After: "!",
  },
  {
    line1: "GOT IT FIGURED OUT?",
    line2Before: "PRESS ",
    line2After: "!",
  },
  {
    line1: "FEELING CONFIDENT?",
    line2Before: "GO FOR THE ",
    line2After: "!",
  },
] as const;

const openPromptIndex = ref(0);
watch(
  () => partyStore.buzzerState,
  (next, prev) => {
    if (next !== "open") return;
    if (prev === "open") return;
    openPromptIndex.value = (openPromptIndex.value + 1) % openPromptTemplates.length;
  },
);

const openPrompt = computed(() => {
  return (
    openPromptTemplates[openPromptIndex.value % openPromptTemplates.length] ??
    openPromptTemplates[0]
  );
});

const leaderTemplates = [
  "Move over! [New Leader] just took the lead!",
  "We have a new leader! All hail [New Leader]!",
  "Plot twist! [New Leader] is now on top!",
  "And just like that, [New Leader] steals the crown!",
] as const;

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
  [...partyStore.players].sort((a: any, b: any) => (b.points ?? 0) - (a.points ?? 0)),
);

const leaderWatchSnapshot = computed(() =>
  partyPlayersByPoints.value.map((p: any) => ({
    playerId: p.playerId,
    username: p.username,
    points: p.points,
  })),
);

const leaderId = computed(() => leaderWatchSnapshot.value[0]?.playerId || null);
const leaderUsername = computed(
  () => leaderWatchSnapshot.value[0]?.username || null,
);

const leaderGapTemplates = [
  "Look at them go! [Player] is leaving everyone else in the dust!",
  "[Player] is on absolute fire! The gap is getting massive!",
  "Is anyone even trying to catch up? [Player] is playing in a league of their own right now!",
  "Unbelievable pace! [Player] is sprinting ahead and looking unstoppable!",
] as const;

const leaderGapTemplateIndex = ref(0);
const leaderGapTemplate = ref<string | null>(null);
let lastLeaderGapKey = "";

const leaderGapActive = computed(() => {
  const first = partyPlayersByPoints.value[0];
  const second = partyPlayersByPoints.value[1];
  const firstPoints = Number(first?.points ?? 0);
  const secondPoints = Number(second?.points ?? 0);
  return firstPoints - secondPoints >= 3;
});

watch(
  [() => partyStore.buzzerState, leaderId, leaderGapActive],
  ([buzzerState, currentLeaderId, gapActive]) => {
    if (buzzerState !== "open") return;
    if (!gapActive) return;
    if (!currentLeaderId) return;
    const key = `${currentLeaderId}|${gameStore.currentRoundIndex}`;
    if (key === lastLeaderGapKey) return;
    lastLeaderGapKey = key;
    const template =
      leaderGapTemplates[leaderGapTemplateIndex.value % leaderGapTemplates.length] ??
      leaderGapTemplates[0];
    leaderGapTemplateIndex.value =
      (leaderGapTemplateIndex.value + 1) % leaderGapTemplates.length;
    leaderGapTemplate.value = template;
  },
);

const leaderGapMessageBefore = computed(() => {
  const t = leaderGapTemplate.value || leaderGapTemplates[0];
  return t.split("[Player]")[0] || "";
});

const leaderGapMessageAfter = computed(() => {
  const t = leaderGapTemplate.value || leaderGapTemplates[0];
  return t.split("[Player]")[1] || "";
});

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

const leaderMessageBefore = computed(() => {
  const t = leaderTemplate.value || leaderTemplates[0];
  return t.split("[New Leader]")[0] || "";
});

const leaderMessageAfter = computed(() => {
  const t = leaderTemplate.value || leaderTemplates[0];
  return t.split("[New Leader]")[1] || "";
});

const isFinalRound = computed(() => Boolean(props.isFinalRound));
const bonusRoundType = computed(() => props.bonusRoundType ?? null);
const isBonusRound = computed(() => Boolean(bonusRoundType.value));
const isDoublePointsRound = computed(
  () => isFinalRound.value || isBonusRound.value,
);
const pointsForCorrect = computed(() => (isDoublePointsRound.value ? 2 : 1));
const pointsForWrong = computed(() => (isDoublePointsRound.value ? 4 : 2));

const resultClass = computed(() => {
  if (!partyStore.activePlayerId) return "timeout";
  return partyStore.roundResult || "";
});

const findUsernameById = (playerId: string | null) => {
  if (!playerId) return null;
  return (
    partyStore.players.find((p: any) => p.playerId === playerId)?.username || null
  );
};

const isFreezeActive = computed(() => typeof partyStore.freezeUntilAt === "number");

const freezeTemplates = [
  "STONE COLD! [Player] used the freeze powerup.",
  "ICE ICE BABY! [Player] hit the freeze powerup.",
  "BRRR... [Player] just froze everyone.",
  "CHILL OUT! [Player] triggered freeze.",
] as const;

const freezeTemplateIndex = ref(0);
const freezeTemplate = ref<string | null>(null);
let lastFreezeUntilAt: number | null = null;
watch(
  () => partyStore.freezeUntilAt,
  (untilAt) => {
    if (typeof untilAt !== "number") {
      lastFreezeUntilAt = null;
      return;
    }
    if (untilAt <= Date.now()) return;
    if (lastFreezeUntilAt === untilAt) return;
    lastFreezeUntilAt = untilAt;
    const template =
      freezeTemplates[freezeTemplateIndex.value % freezeTemplates.length] ??
      freezeTemplates[0];
    freezeTemplateIndex.value = (freezeTemplateIndex.value + 1) % freezeTemplates.length;
    freezeTemplate.value = template;
  },
);

const freezeMessageBefore = computed(() => {
  const t = freezeTemplate.value || freezeTemplates[0];
  return t.split("[Player]")[0] || "";
});

const freezeMessageAfter = computed(() => {
  const t = freezeTemplate.value || freezeTemplates[0];
  return t.split("[Player]")[1] || "";
});

const freezeActorNameUpper = computed(() => {
  const username = findUsernameById(partyStore.freezeByPlayerId);
  return (username || "HOST").toUpperCase();
});

const lightsOutTemplates = [
  "WHAT?! I CAN'T SEE! Oh.. [Player] turned the lights off",
  "BLACKOUT! [Player] just killed the lights",
  "DID THE LIGHTS JUST GO OUT? [Player] did that",
  "NO LIGHTS, NO MERCY. [Player] flipped the switch",
] as const;

const lightsOutTemplateIndex = ref(0);
const lightsOutTemplate = ref<string | null>(null);
let lastLightsOutUntilAt: number | null = null;
watch(
  () => (partyStore as any).lightsOutUntilAt as number | null | undefined,
  (untilAt) => {
    if (typeof untilAt !== "number") {
      lastLightsOutUntilAt = null;
      return;
    }
    if (untilAt <= Date.now()) return;
    if (lastLightsOutUntilAt === untilAt) return;
    lastLightsOutUntilAt = untilAt;
    const template =
      lightsOutTemplates[lightsOutTemplateIndex.value % lightsOutTemplates.length] ??
      lightsOutTemplates[0];
    lightsOutTemplateIndex.value =
      (lightsOutTemplateIndex.value + 1) % lightsOutTemplates.length;
    lightsOutTemplate.value = template;
  },
);

const lightsOutMessageBefore = computed(() => {
  const t = lightsOutTemplate.value || lightsOutTemplates[0];
  return t.split("[Player]")[0] || "";
});

const lightsOutMessageAfter = computed(() => {
  const t = lightsOutTemplate.value || lightsOutTemplates[0];
  return t.split("[Player]")[1] || "";
});

const lightsOutActorNameUpper = computed(() => {
  const username = findUsernameById((partyStore as any).lightsOutByPlayerId || null);
  return (username || "HOST").toUpperCase();
});

const hashToUint32 = (input: string) => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const scrambleText = (text: string, seed: number) => {
  const str = String(text || "");
  if (str.length < 2) return str;

  const scrambleWord = (word: string, wordSeed: number) => {
    if (word.length < 2) return word;
    const chars = word.split("");
    const rand = mulberry32(wordSeed);
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const a = chars[i];
      const b = chars[j];
      if (typeof a !== "string" || typeof b !== "string") continue;
      chars[i] = b;
      chars[j] = a;
    }
    return chars.join("");
  };

  // Only scramble within each term (e.g. "ice cream" => scramble "ice" and "cream" separately)
  const parts = str.split(/(\s+)/);
  return parts
    .map((part, index) => {
      if (/^\s+$/.test(part)) return part;
      const partSeed = hashToUint32(`${seed}|${index}|${part}`);
      return scrambleWord(part, partSeed);
    })
    .join("");
};

const optionColors = [
  { color: "var(--neon-pink)", glow: "var(--pink-glow)" },
  { color: "var(--neon-blue)", glow: "var(--blue-glow)" },
  { color: "var(--neon-purple)", glow: "var(--purple-glow)" },
  { color: "var(--neon-yellow)", glow: "var(--yellow-glow)" },
] as const;

const getOptionStyle = (index: number) => {
  const palette = optionColors;
  const fallback =
    palette[0] ??
    ({ color: "var(--neon-blue)", glow: "var(--blue-glow)" } as const);
  const entry = palette.length ? palette[index % palette.length] : fallback;
  return {
    "--opt-color": entry?.color ?? fallback.color,
    "--opt-glow": entry?.glow ?? fallback.glow,
  } as Record<string, string>;
};

const optionsForPrompt = computed(() => {
  const options: any[] = (gameStore.currentRound?.options || []).slice(0, 4);
  return options.map((opt) => {
    const label = String(opt?.title || opt?.name || "");
    if (!partyStore.isXlzActive) return label;
    const seed = hashToUint32(`${gameStore.currentRoundIndex}|${label}`);
    return scrambleText(label, seed);
  });
});
</script>

<style scoped>
.buzzer-status {
  display: grid;
  grid-template-columns: 6% auto;
  align-items: start;
  gap: 16px;
  width: 100%;
  max-width: 100%;
  margin-top: 16px;
  @media(min-width: 576px) {
    grid-template-columns: 80px auto;
  }
}

.status-pill {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 1.5;
  text-align: left;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.status-pill.result {
  text-transform: none;
}

.status-pill.open {
  border: 2px solid var(--neon-pink);
}

.pink-text {
  color: var(--neon-pink);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.green-text {
  color: var(--neon-success);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.red-text {
  color: var(--neon-error);
  animation: pulse-glow 1.5s infinite ease-in-out;
}

.status-pill.answering {
  border: 2px solid var(--neon-blue);
  color: rgba(255, 255, 255, 0.85);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.status-pill.correct {
  border: 2px solid var(--neon-success);
  color: var(--neon-success);
}

.status-pill.incorrect {
  border: 2px solid var(--neon-error);
  color: var(--neon-error);
}

.status-pill.timeout {
  border: 2px solid var(--neon-blue);
  color: var(--neon-blue);
}

.waiting-player {
  color: #fff;
  opacity: 0.95;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.25);
}

.prompt-option {
  color: var(--opt-color);
  text-shadow: 0 0 10px var(--opt-glow);
  white-space: normal;
}

.answer-highlight {
  color: white;
}

.player-highlight {
  color: white;
}

.powerup-text {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: rgba(255, 255, 255, 0.9);
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 1.5;
  text-transform: uppercase;
  text-align: left;
}

.leader-text {
  margin-top: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid var(--neon-yellow);
  color: var(--neon-yellow);
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 1px;
  line-height: 1.5;
  text-transform: uppercase;
  text-align: left;
}

.white-text {
  color: var(--white);
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(236, 72, 153, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(236, 72, 153, 0.8);
  }
}
</style>
