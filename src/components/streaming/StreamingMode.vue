<template>
  <div class="streaming-mode">
    <ModalWrapper v-if="chatPlatform === 'youtube' && !isSignedIn">
      <div class="stream-auth-modal">
        <h2>Sign in for Stream Mode</h2>
        <label>Google Client ID</label>
        <input
          type="password"
          v-model="clientId"
          placeholder="Paste your OAuth Client ID"
        />

        <label>Client Secret (optional)</label>
        <input
          type="password"
          v-model="clientSecret"
          placeholder="Optional OAuth Client Secret"
        />

        <router-link class="privacy-link" to="/privacy">
          Read how YouTube OAuth and chat messages are processed.
        </router-link>

        <ButtonPrimary
          class="auth-action"
          @clicked="signIn"
          :disabled="authInProgress"
        >
          Sign in (PKCE)
        </ButtonPrimary>
        <ButtonLinkSecondary class="auth-action" link="/stream">
          BACK
        </ButtonLinkSecondary>
      </div>
    </ModalWrapper>

    <div v-else>
      <div class="stream-content">
        <div>
          <div class="rankings">
            <h1 class="logo">PIX<span>REVEAL</span></h1>
            <h3 class="promo-link">
              Play the game on <span>pixreveal.com</span>
            </h3>
            <div class="chat-setup" v-if="!running">
              <div class="platform-picker">
                <button
                  type="button"
                  :class="{ active: chatPlatform === 'youtube' }"
                  @click="chatPlatform = 'youtube'"
                >
                  YouTube
                </button>
                <button
                  type="button"
                  :class="{ active: chatPlatform === 'twitch' }"
                  @click="chatPlatform = 'twitch'"
                >
                  Twitch
                </button>
              </div>
              <input
                v-if="chatPlatform === 'twitch'"
                v-model="twitchChannel"
                placeholder="Twitch channel"
                aria-label="Twitch channel"
              />
              <label class="stream-setting">
                <input v-model="autoStartNextRound" type="checkbox" />
                <span>Start next round automatically</span>
              </label>
              <div class="stream-setting duration-setting">
                <span>Round duration</span>
                <div class="duration-dropdown">
                  <button
                    type="button"
                    class="duration-trigger"
                    :aria-expanded="durationDropdownOpen"
                    aria-haspopup="listbox"
                    @click="durationDropdownOpen = !durationDropdownOpen"
                  >
                    {{ selectedStreamDurationMinutes }} minutes
                  </button>
                  <div
                    v-if="durationDropdownOpen"
                    class="duration-options"
                    role="listbox"
                    aria-label="Round duration"
                  >
                    <button
                      v-for="duration in streamDurationOptions"
                      :key="duration"
                      type="button"
                      role="option"
                      :aria-selected="selectedStreamDurationMinutes === duration"
                      :class="{
                        selected: selectedStreamDurationMinutes === duration,
                      }"
                      @click="selectStreamDuration(duration)"
                    >
                      {{ duration }} minutes
                    </button>
                  </div>
                </div>
              </div>
              <ButtonPrimary
                @clicked="startStreamMode"
                :disabled="chatPlatform === 'twitch' && !twitchChannel.trim()"
              >
                Start {{ chatPlatform === 'twitch' ? "Twitch" : "YouTube" }} Stream
              </ButtonPrimary>
            </div>
            <div
              v-if="running"
              class="stream-clock"
              :class="{ critical: isStreamTimeCritical }"
            >
              TIME LEFT
              <strong>{{ streamTimeDisplay }}</strong>
            </div>
            <div>
              <h2>LEADERBOARD</h2>
              <PlayerDisplay
                v-for="(player, index) in topPlayers"
                :position="index + 1"
                :name="player.username"
                :points="player.points"
                size="small"
              />
            </div>
            <div class="ticker">
              <h3>Accepted Answers</h3>
              <ul>
                <li v-for="(a, i) in acceptedAnswers" :key="i">
                  <strong>{{ a.username }}</strong>
                  <span v-if="a.isCorrect"> — ⭐ {{ a.stars }}</span>
                  <span v-else> — ❌</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class="left">
          <div class="canvas-area">
            <GameHeader
              :count="timerSeconds"
              :max="roundSeconds"
              :is-correct="false"
              :is-incorrect="false"
              :is-survival="false"
            />
            <PixelCanvas
              ref="pixelCanvas"
              :pixelArray="currentDrawing?.data"
              :isRevealing="true"
              :timerDuration="roundDuration / 1000"
            />
          </div>

          <div class="controls" v-if="channelStore.isHost">
            <button class="reset-btn" @click="resetStream">
              Reset Rankings
            </button>
          </div>
        </div>

        <div class="right">
          <div class="info-text">
            <h3>💬 PLAY IN CHAT</h3>
            <p>
              Make your guess! Type
              <span class="answer-key answer-key--pink">1</span>,
              <span class="answer-key answer-key--blue">2</span>,
              <span class="answer-key answer-key--purple">3</span>,
              <span class="answer-key answer-key--yellow">4</span>
              or the full word!
            </p>
          </div>
          <div class="answers">
            <AnswerButtons
              :answers="currentOptions"
              :hasAnswered="timeLeft === 0"
              :inputDisabled="false"
              @answered="onLocalAnswered"
            />
          </div>
        </div>
      </div>
      <div v-if="streamFinished && winner" class="stream-result">
        <h2>STREAM OVER</h2>
        <p>WINNER</p>
        <PlayerDisplay
          :position="1"
          :name="winner.username"
          :points="winner.points"
          size="small"
        />
        <p v-if="autoStartNextRound" class="next-round-countdown">
          NEXT ROUND IN {{ nextRoundCountdown }}S
        </p>
        <ButtonPrimary
          class="next-round-btn"
          :disabled="authInProgress"
          @clicked="startNextStream"
        >
          START NEXT ROUND
        </ButtonPrimary>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import ButtonLinkSecondary from "@/components/page-ui/ButtonLinkSecondary.vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import useYouTubeChat from "@/composables/useYouTubeChat";
import useTwitchChat from "@/composables/useTwitchChat";
import { useStreamStore } from "@/stores/stream";
import { useChannelStore } from "@/stores/channel";
import { useConfetti } from "@/composables/useConfetti";
import drawings from "@/data/drawings.json";

const ytChat = useYouTubeChat();
const twitchChat = useTwitchChat();
const {
  initPKCE,
  handleRedirect,
  fetchLiveChatIdForChannel,
  startPolling,
  stopPolling,
} = ytChat;
const accessToken = ytChat.accessToken;
const signedIn = ref(!!localStorage.getItem("yt_access_token"));
const isSignedIn = computed(() => signedIn.value || !!accessToken?.value);

const clientId = ref("");
const clientSecret = ref("");
const authInProgress = ref(false);
const twitchChannel = ref("");
const autoStartNextRound = ref(false);
const selectedStreamDurationMinutes = ref<5 | 10 | 15>(15);
const streamDurationOptions = [5, 10, 15] as const;
const durationDropdownOpen = ref(false);

function selectStreamDuration(duration: (typeof streamDurationOptions)[number]) {
  selectedStreamDurationMinutes.value = duration;
  durationDropdownOpen.value = false;
}

const running = ref(false);
const roundEnded = ref(false);
const allDrawings = ref<any[]>([]);
const currentIndex = ref(0);
const currentDrawing = ref<any | null>(null);
const roundDuration = ref(15_000); // 15s default
const timeLeft = ref(0);
const timerHandle: { value: number | null } = reactive({ value: null });
const nextRoundCountdown = ref(30);
const nextRoundCountdownHandle: { value: number | null } = reactive({
  value: null,
});
const streamTimeLeft = ref(0);
const streamTimerHandle: { value: number | null } = reactive({ value: null });
const streamFinished = ref(false);
const currentRoundStart = ref<number | null>(null);

const timerSeconds = computed(() =>
  Math.max(0, Math.ceil(timeLeft.value / 1000)),
);
const roundSeconds = computed(() =>
  Math.max(0, Math.ceil(roundDuration.value / 1000)),
);
const streamTimeDisplay = computed(() => {
  const totalSeconds = Math.ceil(streamTimeLeft.value / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});
const isStreamTimeCritical = computed(
  () => streamTimeLeft.value > 0 && streamTimeLeft.value <= 60_000,
);

const acceptedAnswers = ref<
  {
    username: string;
    stars: number;
    createdAt?: number;
    isCorrect?: boolean;
  }[]
>([]);
const currentOptions = ref<any[]>([]);
const pixelCanvas = ref<any | null>(null);

const streamStore = useStreamStore();
const channelStore = useChannelStore();
const { fireConfetti, fireSideCannons } = useConfetti();
const route = useRoute();
const chatPlatform = ref<"youtube" | "twitch">(
  route.meta.chatPlatform === "twitch" ? "twitch" : "youtube",
);

// ---------------------------------------------------------------------
// Scoring: rank-based points (1st correct = 5, 2nd = 3, 3rd = 2, rest = 1)
// with round-history attribution so answers sent during the pause +
// stream/chat delay still get credited to the round they actually
// answered, instead of being lost or wrongly scored against whatever
// round happens to be on screen when we process them.
// ---------------------------------------------------------------------

const RANK_POINTS = [5, 3, 2];
const FALLBACK_POINTS = 0; // only the top 3 correct answers score anything

function pointsForRank(rank: number): number {
  const index = rank - 1; // rank is 1-based
  return RANK_POINTS[index] ?? FALLBACK_POINTS;
}

// How long after a round's timer ends we still attribute chat answers to
// it, to cover stream-delivery delay (viewer sees the puzzle late) plus
// chat polling jitter. Tune to your actually observed stream latency.
const LATENCY_GRACE_MS = 3000;

// Rounds older than their grace window by this much get pruned from
// memory so this doesn't grow unbounded over a long stream.
const PRUNE_BUFFER_MS = 30_000;

type RoundOption = { title: string; isCorrect: boolean }; // title = normalized
type RoundResult = {
  username: string;
  stars: number;
  createdAt: number;
  isCorrect: boolean;
};
type RoundRecord = {
  id: number;
  answer: string; // normalized drawing name (free-text accepted answer)
  options: RoundOption[]; // normalized titles, for numeric 1-4 matching
  startedAt: number;
  endedAt: number | null; // null while the round's timer is still running
  guessed: Set<string>; // per-round dedup, keyed by lowercased username
  correctCount: number;
  results: RoundResult[];
};

const rounds = ref<RoundRecord[]>([]);
let nextRoundId = 1;
const currentRoundRecordId = ref<number | null>(null);

/**
 * Normalizes a guess/answer for comparison: lowercase, trims whitespace,
 * strips diacritics (é -> e), collapses punctuation/extra spaces, and
 * strips common filler people type around multiple-choice answers (e.g.
 * "Antwort: 2", "1)", emoji keycap digits like "1️⃣").
 */
function normalizeAnswer(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[\u20e3]/g, "") // strip emoji "keycap" combining mark (1️⃣ -> 1)
    .replace(/\ufe0f/g, "") // strip emoji variation selector
    .toLowerCase()
    .trim()
    .replace(/\b(antwort|option|nummer|nr)\b/g, "") // common filler words
    .replace(/[^\p{L}\p{N}\s]/gu, "") // strip punctuation, keep letters/numbers/spaces
    .replace(/\s+/g, " ")
    .trim();
}

function pruneOldRounds(nowMs: number) {
  rounds.value = rounds.value.filter((r) => {
    if (r.endedAt === null) return true; // still active, always keep
    const windowEnd = r.endedAt + LATENCY_GRACE_MS;
    return nowMs - windowEnd < PRUNE_BUFFER_MS;
  });
}

/**
 * Finds which tracked round a message's timestamp belongs to: the round
 * whose [startedAt, endedAt ?? +Infinity] window (extended by
 * LATENCY_GRACE_MS once ended) contains the message's publishedAt time.
 * Scans newest-first since rounds don't overlap by design.
 */
function findRoundForTimestamp(messageTimeMs: number): RoundRecord | null {
  for (let i = rounds.value.length - 1; i >= 0; i--) {
    const r = rounds.value[i];
    if (!r) continue;
    const windowEnd =
      r.endedAt === null ? Infinity : r.endedAt + LATENCY_GRACE_MS;
    if (messageTimeMs >= r.startedAt && messageTimeMs <= windowEnd) {
      return r;
    }
  }
  return null;
}

function shuffle<T>(arr: T[]) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function getDistractors(drawing: any, pool: any[]) {
  const colorMatches: any[] = [];
  const categoryMatches: any[] = [];
  const fallbackMatches: any[] = [];

  for (const d of pool) {
    if (d.primaryColor === drawing.primaryColor) {
      colorMatches.push(d);
    } else if (d.category === drawing.category) {
      categoryMatches.push(d);
    } else {
      fallbackMatches.push(d);
    }
  }

  return [...colorMatches, ...categoryMatches, ...fallbackMatches].slice(0, 3);
}

function buildOptionsForDrawing(drawing: any, all: any[]) {
  const pool = shuffle(all.filter((d) => d.name !== drawing.name));
  const distractors = getDistractors(drawing, pool);
  const opts = shuffle([
    { title: drawing.name, isCorrect: true },
    ...distractors.map((d) => ({ title: d.name, isCorrect: false })),
  ]);
  return opts;
}

/** Handles a normalized answer from either YouTube or Twitch chat. */
function processChatAnswer(
  author: string,
  text: string,
  publishedAt: string | undefined,
) {
  if (!text || !publishedAt) return;

  const messageTimeMs = new Date(publishedAt).getTime();
  const round = findRoundForTimestamp(messageTimeMs);

  if (!round) return; // outside any round's grace window — ignore

  const usernameKey = author.toLowerCase();

  const trimmed = text.trim();
  const numericMatch = trimmed.match(/^\s*([1-4])(?:\uFE0F|\u20E3)?\s*$/);

  let matchedOption: RoundOption | undefined;

  if (numericMatch && round.options.length >= 4) {
    matchedOption = round.options[Number(numericMatch[1]) - 1];
  } else {
    const normalizedGuess = normalizeAnswer(trimmed);
    matchedOption = round.options.find((o) => o.title === normalizedGuess);
  }

  // Not a recognizable answer at all (e.g. "ok", random chat banter) —
  // ignore completely. Doesn't consume the user's one attempt and never
  // shows up in the ticker.
  if (!matchedOption) return;

  if (round.guessed.has(usernameKey)) return; // one attempt per user per round
  round.guessed.add(usernameKey);
  streamStore.ensurePlayer(author);

  const isCorrect = matchedOption.isCorrect;

  let stars = 0;
  if (isCorrect) {
    round.correctCount += 1;
    stars = pointsForRank(round.correctCount);
  }

  const entry: RoundResult = {
    username: author,
    stars,
    createdAt: messageTimeMs,
    isCorrect,
  };
  round.results.push(entry);

  if (isCorrect) {
    streamStore.addStars(author, stars);
    streamStore.addPoint(author, stars);
  }

  // Only reflect in the visible ticker if this answer belongs to the round
  // currently on screen — late answers attributed to a just-ended round
  // still score correctly, they just won't visually appear in a ticker
  // that has already moved on to the next drawing.
  if (round.id === currentRoundRecordId.value) {
    acceptedAnswers.value.push(entry);
  }
}

function onYouTubeChatMessage(item: any) {
  processChatAnswer(
    item.authorDetails?.displayName || item.authorDetails?.channelId || "anon",
    item.snippet?.displayMessage ||
      item.snippet?.textMessageDetails?.messageText ||
      "",
    item.snippet?.publishedAt,
  );
}

function onTwitchChatMessage(message: {
  author: string;
  text: string;
  publishedAt: string;
}) {
  processChatAnswer(message.author, message.text, message.publishedAt);
}

/**
 * Handles the streamer's own local answer click. Goes through the same
 * round/rank scoring as chat, so the streamer competes for rank alongside
 * chat guessers, matching the original combined behavior.
 */
function handleLocalAnswer(index: number) {
  const round = rounds.value.find((r) => r.id === currentRoundRecordId.value);
  if (!round) return;
  const option = round.options[index];
  if (!option) return;

  const usernameKey = "streamer";
  if (round.guessed.has(usernameKey)) return;
  round.guessed.add(usernameKey);

  const isCorrect = option.isCorrect;

  let stars = 0;
  if (isCorrect) {
    round.correctCount += 1;
    stars = pointsForRank(round.correctCount);
  }

  const entry: RoundResult = {
    username: "Streamer",
    stars,
    createdAt: Date.now(),
    isCorrect,
  };
  round.results.push(entry);
  acceptedAnswers.value.push(entry);

  if (isCorrect) {
    streamStore.addStars("Streamer", stars);
    streamStore.addPoint("Streamer", stars);
    try {
      pixelCanvas.value?.triggerCorrectAnswer?.();
    } catch (e) {
      /* ignore */
    }
  }
}

function onLocalAnswered(answer: any) {
  const index = currentOptions.value.findIndex((o) => o.title === answer.title);
  if (index >= 0) handleLocalAnswer(index);
}

const topPlayers = computed(() => {
  return streamStore.leaderboard.slice(0, 5).map((p, idx) => ({
    playerId: p.id || String(idx),
    username: p.username,
    avatarIndex: 0,
    points: p.points,
  }));
});
const winner = computed(() => topPlayers.value[0] ?? null);

async function signIn() {
  if (!clientId.value) return alert("Provide client id");
  authInProgress.value = true;
  try {
    await initPKCE(clientId.value, clientSecret.value || undefined);
  } finally {
    authInProgress.value = false;
  }
}

async function startStreamMode() {
  if (chatPlatform.value === "youtube" && !isSignedIn.value) {
    await handleRedirect(clientId.value, clientSecret.value || undefined);
  }

  stopPolling();
  twitchChat.stop();
  if (nextRoundCountdownHandle.value) {
    window.clearInterval(nextRoundCountdownHandle.value);
    nextRoundCountdownHandle.value = null;
  }
  streamStore.resetAll();
  acceptedAnswers.value = [];
  rounds.value = [];
  streamFinished.value = false;
  const streamDurationMs = selectedStreamDurationMinutes.value * 60 * 1000;
  streamTimeLeft.value = streamDurationMs;
  if (streamTimerHandle.value) window.clearInterval(streamTimerHandle.value);
  const streamStartedAt = Date.now();
  streamTimerHandle.value = window.setInterval(() => {
    streamTimeLeft.value = Math.max(
      0,
      streamDurationMs - (Date.now() - streamStartedAt),
    );
    if (streamTimeLeft.value <= 0) finishStream();
  }, 250);
  console.log(`Starting stream mode with ${chatPlatform.value} chat`);

  allDrawings.value = shuffle(drawings as any[]);
  currentIndex.value = 0;
  running.value = true;

  if (chatPlatform.value === "twitch") {
    twitchChat.start(twitchChannel.value, onTwitchChatMessage, (message) => {
      console.log("Twitch chat status:", message);
    });
  } else {
    // Keep the YouTube poller running across round pauses so delayed answers
    // can still be attributed to the round they belong to.
    const liveChatId = await fetchLiveChatIdForChannel();
    if (streamFinished.value) return;
    if (!liveChatId) {
      console.warn("No liveChatId found; streaming chat will not be polled.");
    } else {
      console.log("Starting YouTube chat polling for", liveChatId);
      startPolling(liveChatId, onYouTubeChatMessage, (message: string) => {
        if (message) console.log("YouTube chat status:", message);
      });
    }
  }

  nextRound();
}

function nextRound() {
  if (streamFinished.value) return;
  if (currentIndex.value >= allDrawings.value.length) {
    finishStream();
    return;
  }
  currentDrawing.value = allDrawings.value[currentIndex.value];
  acceptedAnswers.value = [];

  currentRoundStart.value = Date.now();
  timeLeft.value = roundDuration.value;

  currentOptions.value = buildOptionsForDrawing(
    currentDrawing.value,
    drawings as any[],
  );

  pruneOldRounds(currentRoundStart.value);
  const record: RoundRecord = {
    id: nextRoundId++,
    answer: normalizeAnswer(currentDrawing.value.name),
    options: currentOptions.value.map((o) => ({
      title: normalizeAnswer(o.title),
      isCorrect: o.isCorrect,
    })),
    startedAt: currentRoundStart.value,
    endedAt: null,
    guessed: new Set<string>(),
    correctCount: 0,
    results: [],
  };
  rounds.value.push(record);
  currentRoundRecordId.value = record.id;

  timerHandle.value = window.setInterval(() => {
    timeLeft.value = Math.max(
      0,
      roundDuration.value -
        (Date.now() - (currentRoundStart.value || Date.now())),
    );
    if (timeLeft.value <= 0) {
      // Mark this round's end time — it stays eligible to receive late
      // chat answers for LATENCY_GRACE_MS after this point, it just stops
      // being "current" for the ticker/UI.
      const activeRound = rounds.value.find(
        (r) => r.id === currentRoundRecordId.value,
      );
      if (activeRound) activeRound.endedAt = Date.now();

      if (timerHandle.value) window.clearInterval(timerHandle.value);
      currentIndex.value++;
      if (streamFinished.value) return;
      // Fixed pause between rounds. Chat polling keeps running throughout
      // this pause (see startStreamMode) so late answers still arrive.
      setTimeout(nextRound, 5000);
    }
  }, 250);
}

function finishStream() {
  if (streamFinished.value) return;
  streamFinished.value = true;
  running.value = false;
  streamTimeLeft.value = 0;
  if (streamTimerHandle.value) {
    window.clearInterval(streamTimerHandle.value);
    streamTimerHandle.value = null;
  }
  if (timerHandle.value) {
    window.clearInterval(timerHandle.value);
    timerHandle.value = null;
  }
  stopPolling();
  twitchChat.stop();
  if (winner.value) {
    fireConfetti();
    fireSideCannons();
    if (autoStartNextRound.value) {
      nextRoundCountdown.value = 30;
      nextRoundCountdownHandle.value = window.setInterval(() => {
        nextRoundCountdown.value -= 1;
        if (nextRoundCountdown.value <= 0) {
          if (nextRoundCountdownHandle.value) {
            window.clearInterval(nextRoundCountdownHandle.value);
            nextRoundCountdownHandle.value = null;
          }
          startNextStream();
        }
      }, 1000);
    }
  }
}

async function startNextStream() {
  finishStream();
  await startStreamMode();
}

function resetStream() {
  if (!channelStore.isHost) {
    window.alert("Only the host can reset the rankings.");
    return;
  }
  const ok = window.confirm("Reset stream rankings and clear stored players?");
  if (!ok) return;
  streamStore.resetAll();
  acceptedAnswers.value = [];
  rounds.value = [];
}

onBeforeUnmount(() => {
  if (timerHandle.value) window.clearInterval(timerHandle.value);
  if (streamTimerHandle.value) window.clearInterval(streamTimerHandle.value);
  if (nextRoundCountdownHandle.value) {
    window.clearInterval(nextRoundCountdownHandle.value);
  }
  stopPolling();
  twitchChat.stop();
});

onMounted(async () => {
  // attempt to handle redirect if coming back from OAuth
  try {
    await handleRedirect(clientId.value);
  } catch (e) {
    /* ignore */
  }
});
</script>

<style scoped>
.streaming-mode {
  padding: 16px;
}

.privacy-link {
  display: block;
  margin: 12px 0 16px;
  color: rgba(255, 255, 255, 0.68);
  font-size: 12px;
  line-height: 1.4;
  text-decoration: underline;
}

.auth-action {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
}

.stream-content {
  display: flex;
  gap: 16px;
  width: 100%;
  margin-bottom: 16px;
}
.left {
  flex: 1;
  min-width: 0;
}
.right {
  flex: 0 0 320px;
  display: flex;
  flex-direction: column;
  place-items: center;

  gap: 12px;
  padding: 32px;
  background: #111;
}
.canvas-area {
  background: #111;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
}
.canvas-placeholder {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.06);
  border-radius: 6px;
}
.answers {
  width: 400px;
  padding: 8px;
  border-radius: 6px;
}
.auth,
.chat-setup {
  margin-bottom: 12px;
}

.stream-setting {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0;
  font-size: 13px;
}

.stream-setting input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.duration-setting {
  justify-content: space-between;
}

.duration-dropdown {
  position: relative;
  min-width: 128px;
}

.duration-trigger {
  width: 100%;
  padding: 6px 8px;
  margin: 0;
  color: inherit;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: left;
}

.duration-options {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  left: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  padding: 4px;
  background: #111;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.6);
}

.duration-options button {
  width: 100%;
  padding: 7px 8px;
  margin: 0;
  color: inherit;
  text-align: left;
  border: 0;
}

.duration-options button:hover,
.duration-options button.selected {
  color: #000;
  background: var(--primary);
}

.stream-clock {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 20px 0;
  color: var(--neon-yellow);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
}

.stream-clock strong {
  display: inline-block;
  font-size: 32px;
  letter-spacing: 1px;
}

.stream-clock.critical,
.stream-clock.critical strong {
  color: var(--neon-error);
}

.stream-clock.critical strong {
  animation: stream-time-pulse 1s ease-in-out infinite;
}

.stream-result {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 20;
  width: min(420px, calc(100vw - 32px));
  margin: 0;
  padding: 16px;
  transform: translate(-50%, -50%);
  border: 2px solid var(--primary);
  border-radius: 8px;
  background: rgba(5, 4, 12, 0.96);
  box-shadow:
    0 0 24px rgba(255, 255, 255, 0.2),
    0 16px 60px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
}

.stream-result h2,
.stream-result p {
  margin: 0 0 8px;
}

.stream-result .next-round-countdown {
  margin: 16px 0 0;
  color: var(--neon-yellow);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.stream-result p {
  color: var(--neon-yellow);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.next-round-btn {
  width: 100%;
  margin-top: 16px;
}

@keyframes stream-time-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.65;
    transform: scale(1.04);
  }
}

input {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
  box-sizing: border-box;
}
button {
  margin-top: 6px;
}

.rankings {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100%;
  width: 360px;
  background: #111;
  padding: 32px;
}

.ticker {
  margin-top: auto;
}

.promo-link span {
  color: var(--neon-yellow);
  font-weight: 900;
}

.logo {
  margin-bottom: 0;
  text-align: left;
}

.info-text {
  background: var(--primary);
  width: 100%;
  padding: 16px;
  margin-bottom: 32px;
  box-sizing: border-box;
  border-radius: 8px;
  border: 3px solid #fff;
  border-top-color: rgba(255, 255, 255, 0.5);
  border-left-color: rgba(255, 255, 255, 0.5);
  border-right-color: rgba(0, 0, 0, 0.65);
  border-bottom-color: rgba(0, 0, 0, 0.65);
  box-shadow:
    inset 2px 2px 0 rgba(255, 255, 255, 0.1),
    inset -2px -2px 0 rgba(0, 0, 0, 0.2),
    4px 5px 0 rgba(0, 0, 0, 0.5);
  color: #fff;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000;
  h3 {
    margin-top: 0;
    margin-bottom: 0;
  }
  p {
    margin-top: 8px;
    margin-bottom: 0;
    text-shadow: 1px 1px 0 #000;
  }
}

.answer-key {
  display: inline-block;
  margin: 0 2px;
  font-weight: 900;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    2px 2px 0 #000;
}

.answer-key--pink {
  color: var(--neon-pink);
}

.answer-key--blue {
  color: var(--neon-blue);
}

.answer-key--purple {
  color: var(--neon-purple);
}

.answer-key--yellow {
  color: var(--neon-yellow);
}
</style>