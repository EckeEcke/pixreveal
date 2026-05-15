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
          THINK YOU KNOW THE ANSWER?
          <br />
          HIT THE <span class="pink-text">BUZZ</span>!
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
            1 point for
            <span class="player-highlight">{{ activePlayerNameUpper }}</span
            >.
          </template>

          <template v-else>
            ✗ WRONG! The correct answer was
            <span class="answer-highlight">{{
              gameStore.currentRound?.answer
            }}</span
            >.
            <span class="player-highlight">{{ activePlayerName }}</span> loses 2
            points.
          </template>
	        </div>
	      </Transition>

        <Transition name="fade">
          <div v-if="partyStore.isLightsOut" class="powerup-text">
            WHAT?! I CAN'T SEE! Oh..
            <span class="player-highlight">{{ lightsOutActorNameUpper }}</span>
            turned the lights off
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="isFreezeActive" class="powerup-text">
            STONE COLD!
            <span class="player-highlight">{{ freezeActorNameUpper }}</span>
            used the freeze powerup.
          </div>
        </Transition>
	    </div>
	  </div>
	</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePartyStore } from "@/stores/party";
import { useGameStore } from "@/stores/game";
import RobotModerator from "./RobotModerator.vue";

const gameStore = useGameStore();
const partyStore = usePartyStore();

const activePlayerName = computed(
  () => partyStore.activePlayer?.username || "Player",
);

const activePlayerNameUpper = computed(() =>
  activePlayerName.value.toUpperCase(),
);

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

const freezeActorNameUpper = computed(() => {
  const username = findUsernameById(partyStore.freezeByPlayerId);
  return (username || "HOST").toUpperCase();
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
  grid-template-columns: 80px auto;
  align-items: start;
  gap: 16px;
  width: 100%;
  margin-top: 16px;
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

.status-pill.answering {
  border: 2px solid var(--neon-blue);
  color: rgba(255, 255, 255, 0.85);
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
  white-space: nowrap;
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
