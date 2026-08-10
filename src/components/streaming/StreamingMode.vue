<template>
  <div class="streaming-mode">
    <ModalWrapper v-if="!isSignedIn">
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

        <ButtonPrimary @clicked="signIn" :disabled="authInProgress"
          >Sign in (PKCE)</ButtonPrimary
        >
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
              <ButtonPrimary @clicked="startStreamMode"
                >Start Stream Mode</ButtonPrimary
              >
            </div>
            <div class="chat-debug" :class="{ 'chat-debug-active': running }">
              {{
                chatDebug ||
                "Chat status will appear here once stream mode starts."
              }}
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
            <p>Make your guess! Type 1, 2, 3, 4 or the full word!</p>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import ModalWrapper from "@/components/modals/ModalWrapper.vue";
import ButtonPrimary from "@/components/page-ui/ButtonPrimary.vue";
import PlayerDisplay from "@/components/game-ui/PlayerDisplay.vue";
import GameHeader from "@/components/game-ui/GameHeader.vue";
import AnswerButtons from "@/components/game-ui/AnswerButtons.vue";
import PixelCanvas from "@/components/canvas/PixelCanvas.vue";
import useYouTubeChat from "@/composables/useYouTubeChat";
import { useStreamStore } from "@/stores/stream";
import { useChannelStore } from "@/stores/channel";
import drawings from "@/data/drawings.json";

const ytChat = useYouTubeChat();
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

const running = ref(false);
const roundEnded = ref(false);
const allDrawings = ref<any[]>([]);
const currentIndex = ref(0);
const currentDrawing = ref<any | null>(null);
const roundDuration = ref(15_000); // 15s default
const timeLeft = ref(0);
const timerHandle: { value: number | null } = reactive({ value: null });
const currentRoundStart = ref<number | null>(null);

const timerSeconds = computed(() =>
  Math.max(0, Math.ceil(timeLeft.value / 1000)),
);
const roundSeconds = computed(() =>
  Math.max(0, Math.ceil(roundDuration.value / 1000)),
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
const chatDebug = ref("");

const streamStore = useStreamStore();
const channelStore = useChannelStore();

// ---------------------------------------------------------------------
// Scoring: rank-based points (1st correct = 5, 2nd = 3, 3rd = 2, rest = 1)
// with round-history attribution so answers sent during the pause +
// stream/chat delay still get credited to the round they actually
// answered, instead of being lost or wrongly scored against whatever
// round happens to be on screen when we process them.
// ---------------------------------------------------------------------

const RANK_POINTS = [5, 3, 2];
const FALLBACK_POINTS = 1;

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

/**
 * Handles one incoming YouTube chat message: figures out which round it
 * actually belongs to (via publishedAt, not "whatever is on screen now"),
 * enforces one attempt per user per round, matches numeric (1-4) or
 * free-text guesses, and awards rank-based points on a correct answer.
 */
function onChatMessage(item: any) {
  const author =
    item.authorDetails?.displayName || item.authorDetails?.channelId || "anon";
  const text =
    item.snippet?.displayMessage ||
    (item.snippet?.textMessageDetails &&
      item.snippet.textMessageDetails.messageText) ||
    "";
  const publishedAt: string | undefined = item.snippet?.publishedAt;

  if (!text || !publishedAt) return;

  const messageTimeMs = new Date(publishedAt).getTime();
  const round = findRoundForTimestamp(messageTimeMs);

  if (!round) {
    chatDebug.value = `recv=${text} author=${author} (no matching round — outside any grace window)`;
    return;
  }

  chatDebug.value = `recv=${text} author=${author} round=${round.id}`;

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
  if (!isSignedIn.value) {
    await handleRedirect(clientId.value, clientSecret.value || undefined);
  }

  stopPolling();
  streamStore.resetAll();
  acceptedAnswers.value = [];
  rounds.value = [];
  chatDebug.value = "Starting stream...";
  console.log("Starting stream mode and initializing YouTube chat polling");

  allDrawings.value = shuffle(drawings as any[]);
  currentIndex.value = 0;
  running.value = true;

  // Chat polling is started ONCE here and runs continuously for the whole
  // stream session — it deliberately does NOT stop/restart between
  // rounds. Stopping it during the pause would mean late answers (sent
  // during the pause + stream delay) never arrive at all, which defeats
  // the round-history/grace-window attribution below.
  chatDebug.value = "Looking up the active YouTube live chat...";
  const liveChatId = await fetchLiveChatIdForChannel();
  if (!liveChatId) {
    chatDebug.value =
      "No active YouTube live chat was found for this account, so chat polling is paused.";
    console.warn("No liveChatId found; streaming chat will not be polled.");
  } else {
    chatDebug.value = `Polling YouTube live chat ${liveChatId}...`;
    console.log("Starting YouTube chat polling for", liveChatId);
    startPolling(liveChatId, onChatMessage, (message: string) => {
      if (message) {
        chatDebug.value = message;
        console.log("YouTube chat status:", message);
      }
    });
  }

  nextRound();
}

function nextRound() {
  if (currentIndex.value >= allDrawings.value.length) {
    running.value = false;
    stopPolling();
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
      // Fixed pause between rounds. Chat polling keeps running throughout
      // this pause (see startStreamMode) so late answers still arrive.
      setTimeout(nextRound, 5000);
    }
  }, 250);
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
  stopPolling();
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
input {
  width: 100%;
  padding: 6px;
  margin-top: 6px;
  box-sizing: border-box;
}
button {
  margin-top: 6px;
}
.chat-debug {
  margin-top: 8px;
  color: #ccc;
  font-size: 0.85rem;
  white-space: pre-wrap;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 8px 10px;
  border-radius: 6px;
  min-height: 42px;
}

.chat-debug-active {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.18);
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
  background: #333;
  width: 100%;
  padding: 16px;
  margin-bottom: 32px;
  box-sizing: border-box;
  border-radius: 8px;
  border: 2px solid var(--primary);
  h3 {
    margin-top: 0;
    margin-bottom: 0;
  }
  p {
    margin-top: 8px;
    margin-bottom: 0;
  }
}
</style>