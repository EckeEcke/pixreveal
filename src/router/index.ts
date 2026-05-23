import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useGameStore } from "@/stores/game";
import { useDailyStore } from "@/stores/daily";
import { useChannelStore } from "@/stores/channel";
import { usePartyStore } from "@/stores/party";
import { useOnlineStore } from "@/stores/online";

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: {
        robots: "index, follow",
        title: "PixReveal - Guess the Pixel Art",
        description:
          "Guess pixel art drawings in real-time with your friends. Host a local party game, join online lobbies, or solve the daily puzzle directly in your browser.",
      },
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("@/views/EditorView.vue"),
      meta: {
        robots: "index, follow",
        title: "Editor - PixReveal",
        description:
          "Create your own pixel art drawings and contribute to the official PixReveal game gallery.",
      },
    },
    {
      path: "/singleplayer",
      name: "singleplayer",
      component: () => import("@/views/SinglePlayerView.vue"),
      meta: {
        robots: "index, follow",
        title: "Singleplayer Modes - PixReveal",
        description:
          "Test your skills in 5 singleplayer modes. Race against time or beat the daily puzzle challenge.",
      },
    },
    {
      path: "/classic",
      name: "classic",
      component: () => import("@/views/GameView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/online",
      name: "online",
      component: () => import("@/views/GameView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/survival",
      name: "survival",
      component: () => import("@/views/SurvivalView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/buzzer",
      name: "buzzer",
      component: () => import("@/views/BuzzerView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/inspect",
      name: "inspect",
      component: () => import("@/views/InspectView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/gravity",
      name: "gravity",
      component: () => import("@/views/GravityView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/daily",
      name: "daily",
      component: () => import("@/views/DailyView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/rankings-daily",
      name: "rankings-daily",
      component: () => import("@/views/DailyRankingsView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/rankings-yesterday",
      name: "rankings-yesterday",
      component: () => import("@/views/YesterdayRankingsView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/gameover-daily",
      name: "gameover-daily",
      component: () => import("@/views/GameOverDailyView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/gameover",
      name: "gameover",
      component: () => import("@/views/GameOverView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/gameover-party",
      name: "gameover-party",
      component: () => import("@/views/GameOverPartyView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/lobby",
      name: "lobby",
      component: () => import("@/views/LobbyView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/party-lobby",
      name: "party-lobby",
      component: () => import("@/views/LobbyView.vue"),
      meta: { robots: "noindex", mode: "party" },
    },
    {
      path: "/party-host",
      name: "party-host",
      component: () => import("@/views/PartyHostView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/party-player",
      name: "party-player",
      component: () => import("@/views/PartyPlayerView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/play-party",
      name: "play-party",
      component: () => import("@/views/PlayPartyView.vue"),
      meta: {
        robots: "index, follow",
        title: "Play Local Party Game - PixReveal",
        description:
          "Connect your smartphones, set up your room, and get ready for a local multiplayer pixel art showdown.",
      },
    },
    {
      path: "/play-online",
      name: "play-online",
      component: () => import("@/views/PlayOnlineView.vue"),
      meta: {
        robots: "index, follow",
        title: "Play Online Multiplayer - PixReveal",
        description:
          "Join or host online custom lobbies to compete against your friends worldwide.",
      },
    },
    {
      path: "/free-jackbox-alternative",
      name: "free-jackbox-alternative",
      component: () => import("@/views/FreeJackboxAlternativeView.vue"),
      meta: {
        robots: "index, follow",
        title: "Free Jackbox Alternative - Local Party Multiplayer | PixReveal",
        description:
          "Turn your smartphones into controllers! Host PixReveal on your TV or laptop and play the ultimate party game with your friends.",
      },
    },
    {
      path: "/about",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
      meta: {
        robots: "index, follow",
        title: "About PixReveal",
        description:
          "Learn more about the development, the roadmap, and the features behind PixReveal.",
      },
    },
    {
      path: "/blog",
      name: "blog",
      component: () => import("@/views/BlogView.vue"),
      meta: {
        robots: "index, follow",
        title: "PixReveal Blog - Updates & News",
        description:
          "Stay up to date with the latest features, patch notes, and multiplayer announcements from PixReveal.",
      },
    },
    {
      path: "/user-gallery",
      name: "gallery",
      component: () => import("@/views/GalleryView.vue"),
      meta: { robots: "noindex" },
    },
    // Path Guard: always put at the bottom!
    {
      path: "/:pathMatch(.*)*",
      component: () => import("@/views/NotFoundView.vue"),
      meta: { robots: "noindex" },
    },
  ],
});

router.beforeEach((to, from) => {
  const gameStore = useGameStore();
  const channelStore = useChannelStore();
  const partyStore = usePartyStore();
  const onlineStore = useOnlineStore();

  // Invite links / QR codes: `/?id=ROOMID&mode=party|online[&role=host|join]`
  if (to.path === "/" && typeof to.query?.id === "string") {
    const inviteMode = String(to.query?.mode || "");
    const inviteRole = String(to.query?.role || "join");
    if (inviteMode === "party") {
      return {
        path: "/play-party",
        query: { id: to.query.id, role: inviteRole },
      };
    }
    if (inviteMode === "online") {
      return {
        path: "/play-online",
        query: { id: to.query.id, role: inviteRole },
      };
    }
  }

  const validPathsForGameOver = [
    "/classic",
    "/online",
    "/survival",
    "/buzzer",
    "/inspect",
    "/gravity",
    "/party-host",
    "/party-player",
  ];

  const needRounds = [
    "/classic",
    "/online",
    "/buzzer",
    "/inspect",
    "/gravity",
    "/party-host",
    "/daily",
  ];

  if (
    needRounds.includes(to.path) &&
    (!gameStore.rounds || gameStore.rounds.length <= 0)
  ) {
    return "/";
  }

  if (to.path === "/daily" && useDailyStore().hasPlayedToday) {
    return "/";
  }

  if (
    (to.path === "/gameover" || to.path === "/gameover-party") &&
    !validPathsForGameOver.includes(from.path)
  ) {
    return "/";
  }

  if (
    (from.path === "/gameover" ||
      from.path === "/gameover-daily" ||
      from.path === "/gameover-party") &&
    (validPathsForGameOver.includes(to.path) || to.path === "/daily")
  ) {
    const isPartyReplayNavigation =
      from.path === "/gameover-party" &&
      (to.path === "/party-player" || to.path === "/party-host") &&
      channelStore.mode === "party" &&
      channelStore.onlineGameRunning &&
      partyStore.consumeReplayNavigationWindow?.();

    if (isPartyReplayNavigation) return true;

    const isOnlineReplayNavigation =
      from.path === "/gameover" &&
      to.path === "/online" &&
      channelStore.mode === "regular" &&
      channelStore.onlineGameRunning &&
      onlineStore.consumeReplayNavigationWindow?.();

    if (isOnlineReplayNavigation) return true;
    return "/";
  }

  return true;
});

router.onError((err: any) => {
  const message = String(err?.message || "");
  const name = String(err?.name || "");
  const isChunkLoadError =
    name === "ChunkLoadError" ||
    /Loading chunk \d+ failed/i.test(message) ||
    /failed to fetch dynamically imported module/i.test(message) ||
    /importing a module script failed/i.test(message);

  if (!isChunkLoadError) return;

  try {
    const key = "pixreveal_router_chunk_reload_v1";
    if (sessionStorage.getItem(key) === "1") return;
    sessionStorage.setItem(key, "1");
    window.location.reload();
  } catch {
    window.location.reload();
  }
});

export default router;
