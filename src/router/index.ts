import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { usePlayerStore } from "@/stores/player";

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
      component: () => import("../views/EditorView.vue"),
    },
    {
      path: "/game",
      name: "game",
      component: () => import("../views/GameView.vue"),
    },
    {
      path: "/gameover",
      name: "gameover",
      component: () => import("../views/GameOverView.vue"),
    },
    {
      path: "/lobby",
      name: "lobby",
      component: () => import("../views/LobbyView.vue"),
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
