import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { usePlayerStore } from "@/stores/player";
import GameView from "@/views/GameView.vue";
import GameOverView from "@/views/GameOverView.vue";
import LobbyView from "@/views/LobbyView.vue";
import EditorView from "@/views/EditorView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/editor",
      name: "editor",
      component: EditorView,
    },
    {
      path: "/game",
      name: "game",
      component: GameView,
    },
    {
      path: "/gameover",
      name: "gameover",
      component: GameOverView,
    },
    {
      path: "/lobby",
      name: "lobby",
      component: LobbyView,
    },
    {
      // PATH GUARD: always put in the end
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

router.beforeEach((to, from, next) => {
  const playerStore = usePlayerStore();

  const protectedRoutes = ["/game", "/gameover"];

  if (protectedRoutes.includes(to.path)) {
    if (!playerStore.playerName || !playerStore.avatarIndex) {
      return next('/');
    }
  }

  next();
});

export default router;
