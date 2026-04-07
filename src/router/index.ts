import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { usePlayerStore } from "@/stores/player";
import GameView from "@/views/GameView.vue";
import SurvivalView from "@/views/SurvivalView.vue";
import GameOverView from "@/views/GameOverView.vue";
import LobbyView from "@/views/LobbyView.vue";
import EditorView from "@/views/EditorView.vue";
import BuzzerView from "@/views/BuzzerView.vue";
import InspectView from "@/views/InspectView.vue";
import NotFoundView from "@/views/NotFoundView.vue";
import AboutView from "@/views/AboutView.vue";
import { useGameStore } from "@/stores/game";
import GravityView from "@/views/GravityView.vue";

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
      component: EditorView,
      meta: { robots: "index, follow" },
    },
    {
      path: "/game",
      name: "game",
      component: GameView,
      meta: { robots: "noindex" },
    },
    {
      path: "/survival",
      name: "survival",
      component: SurvivalView,
      meta: { robots: "noindex" },
    },
    {
      path: "/buzzer",
      name: "buzzer",
      component: BuzzerView,
      meta: { robots: "noindex" },
    },
    {
      path: "/inspect",
      name: "inspect",
      component: InspectView,
      meta: { robots: "noindex" },
    },
    {
      path: "/gravity",
      name: "gravity",
      component: GravityView,
      meta: { robots: "noindex" },
    },
    {
      path: "/gameover",
      name: "gameover",
      component: GameOverView,
      meta: { robots: "noindex" },
    },
    {
      path: "/lobby",
      name: "lobby",
      component: LobbyView,
      meta: { robots: "noindex" },
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
      meta: { robots: "index, follow" },
    },
    {
      // PATH GUARD: always put in the end
      path: "/:pathMatch(.*)*",
      component: NotFoundView,
      meta: { robots: "noindex" },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const playerStore = usePlayerStore();
  const gameStore = useGameStore();

  const protectedRoutes = [
    "/game",
    "/gameover",
    "/survival",
    "/buzzer",
    "/inspect",
    "/gravity"
  ];
  const validPathsForGameOver = [
    "/game",
    "/survival",
    "/buzzer",
    "/inspect",
    "/gravity"
  ];
  const needRounds = ["/game", "/buzzer", "/inspect", "/gravity"];

  if (protectedRoutes.includes(to.path)) {
    if (!playerStore.playerName || !(playerStore.avatarIndex + 1)) {
      return next("/");
    }
  }

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
