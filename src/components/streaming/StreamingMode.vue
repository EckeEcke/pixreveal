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
                  <strong>{{ a.username }}</strong> — ⭐ {{ a.stars
                  }}<span v-if="!a.isCorrect"> — "{{ a.text }}"</span>
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

const answeredThisRound = new Set<string>();
const acceptedAnswers = ref<
  {
    username: string;
    text: string;
    stars: number;
    drawing?: string;
    createdAt?: number;
    isCorrect?: boolean;
  }[]
>([]);
const currentOptions = ref<any[]>([]);
const pixelCanvas = ref<any | null>(null);
const chatDebug = ref("");

const streamStore = useStreamStore();
const channelStore = useChannelStore();
let currentChatSession = 0;

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

const chatLatencyMs = 3000;

function computeStarsFromRemaining(remainingMs: number) {
  const max = 5;
  const ratio = Math.max(0, remainingMs / roundDuration.value);
  return Math.max(1, Math.ceil(ratio * max));
}

function getChatStarCount() {
  const remaining = Math.max(0, timeLeft.value - chatLatencyMs);
  return computeStarsFromRemaining(remaining);
}

function getLocalStarCount() {
  return computeStarsFromRemaining(timeLeft.value);
}

function onChatMessage(item: any) {
  const author =
    item.authorDetails?.displayName || item.authorDetails?.channelId || "anon";
  const text =
    item.snippet?.displayMessage ||
    (item.snippet?.textMessageDetails &&
      item.snippet.textMessageDetails.messageText) ||
    "";
  if (!currentDrawing.value) return;

  chatDebug.value = `recv=${text} author=${author} options=${currentOptions.value.length}`;

  const usernameKey = author.toLowerCase();
  if (answeredThisRound.has(usernameKey)) return;

  const trimmed = text.trim();
  const numericMatch = trimmed.match(/^\s*([1-4])(?:\uFE0F|\u20E3)?\s*$/);
  if (numericMatch && currentOptions.value.length >= 4) {
    handleChatAnswer(author, Number(numericMatch[1]) - 1);
    return;
  }

  if (
    trimmed.toLowerCase() ===
    String(currentDrawing.value.name).trim().toLowerCase()
  ) {
    answeredThisRound.add(usernameKey);
    const stars = getChatStarCount();
    acceptedAnswers.value.push({
      username: author,
      text,
      stars,
      drawing: currentDrawing.value.name,
      createdAt: Date.now(),
      isCorrect: true,
    });
    streamStore.addStars(author, stars);
    streamStore.addPoint(author, stars);
  }
}

function handleChatAnswer(author: string, index: number) {
  if (!currentOptions.value || !currentOptions.value[index]) return;
  const usernameKey = author.toLowerCase();
  if (answeredThisRound.has(usernameKey)) return;
  answeredThisRound.add(usernameKey);
  const option = currentOptions.value[index];
  const stars =
    author === "Streamer" ? getLocalStarCount() : getChatStarCount();
  acceptedAnswers.value.push({
    username: author,
    text: option.title,
    stars,
    drawing: currentDrawing.value?.name,
    createdAt: Date.now(),
    isCorrect: option.isCorrect,
  });
  if (option.isCorrect) {
    streamStore.addStars(author, stars);
    streamStore.addPoint(author, stars);
    if (author === "Streamer") {
      try {
        pixelCanvas.value?.triggerCorrectAnswer?.();
      } catch (e) {
        /* ignore */
      }
    }
  } else {
    // incorrect answers do not award points
  }
}

function onLocalAnswered(answer: any) {
  // local streamer click handling (use name 'Streamer')
  const author = "Streamer";
  const index = currentOptions.value.findIndex((o) => o.title === answer.title);
  if (index >= 0) handleChatAnswer(author, index);
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
    const redirected = await handleRedirect(
      clientId.value,
      clientSecret.value || undefined,
    );
  }

  stopPolling();
  streamStore.resetAll();
  acceptedAnswers.value = [];
  answeredThisRound.clear();
  chatDebug.value = "Starting stream...";
  console.log("Starting stream mode and initializing YouTube chat polling");

  allDrawings.value = shuffle(drawings as any[]);
  currentIndex.value = 0;
  running.value = true;
  nextRound();
}

async function nextRound() {
  if (currentIndex.value >= allDrawings.value.length) {
    running.value = false;
    stopPolling();
    return;
  }
  currentDrawing.value = allDrawings.value[currentIndex.value];
  acceptedAnswers.value = [];
  answeredThisRound.clear();
  currentChatSession++;

  currentRoundStart.value = Date.now();
  timeLeft.value = roundDuration.value;

  // build 4 options (1 correct + 3 distractors)
  currentOptions.value = buildOptionsForDrawing(
    currentDrawing.value,
    drawings as any[],
  );

  // determine liveChatId
  chatDebug.value = "Looking up the active YouTube live chat...";
  const liveChatId = await fetchLiveChatIdForChannel();
  if (!liveChatId) {
    chatDebug.value =
      "No active YouTube live chat was found for this account, so chat polling is paused.";
    console.warn("No liveChatId found; streaming chat will not be polled.");
  } else {
    chatDebug.value = `Polling YouTube live chat ${liveChatId}...`;
    console.log("Starting YouTube chat polling for", liveChatId);
    stopPolling();
    const sessionId = currentChatSession;
    startPolling(
      liveChatId,
      (item: any) => {
        if (sessionId !== currentChatSession) return;
        onChatMessage(item);
      },
      (message: string) => {
        if (message) {
          chatDebug.value = message;
          console.log("YouTube chat status:", message);
        }
      },
    );
  }
  timerHandle.value = window.setInterval(() => {
    timeLeft.value = Math.max(
      0,
      roundDuration.value -
        (Date.now() - (currentRoundStart.value || Date.now())),
    );
    if (timeLeft.value <= 0) {
      // end round
      if (timerHandle.value) window.clearInterval(timerHandle.value);
      stopPolling();
      currentIndex.value++;
      // short fixed delay between rounds
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
