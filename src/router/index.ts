import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useGameStore } from "@/stores/game";
import { useDailyStore } from "@/stores/daily";

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
      meta: { robots: "index, follow" },
    },
    {
      path: "/editor",
      name: "editor",
      component: () => import("@/views/EditorView.vue"),
      meta: { robots: "index, follow" },
    },
    {
      path: "/singleplayer",
      name: "singleplayer",
      component: () => import("@/views/SinglePlayerView.vue"),
      meta: { robots: "index, follow" },
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
      path: "/about",
      name: "about",
      component: () => import("@/views/AboutView.vue"),
      meta: { robots: "index, follow" },
    },
    {
      path: "/updates",
      name: "updates",
      component: () => import("@/views/DevlogView.vue"),
      meta: { robots: "index, follow" },
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

router.beforeEach((to, from, next) => {
  const gameStore = useGameStore();

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
  ];

  if (
    needRounds.includes(to.path) &&
    (!gameStore.rounds || gameStore.rounds.length <= 0)
  ) {
    return next("/");
  }

  if (to.path === "/daily" && (useDailyStore().hasPlayedToday || from.path !== "/singleplayer")) {
    return next("/");
  }

  if (to.path === "/gameover" && !validPathsForGameOver.includes(from.path)) {
    return next("/");
  }

  next();
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
