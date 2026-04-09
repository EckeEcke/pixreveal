import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { usePlayerStore } from "@/stores/player";
import { useGameStore } from "@/stores/game";

const router = createRouter({
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
      path: "/game",
      name: "game",
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
    "/game",
    "/survival",
    "/buzzer",
    "/inspect",
    "/gravity",
    "/party-host",
  ];
  const needRounds = ["/game", "/buzzer", "/inspect", "/gravity", "/party-host"];

  if (
    needRounds.includes(to.path) &&
    (!gameStore.rounds || gameStore.rounds.length <= 0)
  ) {
    return next("/");
  }

  if (to.path === "/gameover" && !validPathsForGameOver.includes(from.path)) {
    return next("/");
  }

  next();
});

router.afterEach((to) => {
  if ((window as any).goatcounter && (window as any).goatcounter?.count) {
    (window as any).goatcounter.count({
      path: to.fullPath,
      title: to.name || to.path,
      event: false,
    });
  }
});

export default router;
