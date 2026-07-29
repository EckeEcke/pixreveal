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
        title: "PixReveal – Free Pixel Art Party & Daily Guessing Game",
        description:
          "Play PixReveal for free: guess pixel art with friends, host a Jackbox-style party game, join online lobbies, or solve the daily challenge in your browser.",
        canonical: "https://www.pixreveal.com/",
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
        canonical: "https://www.pixreveal.com/editor",
      },
    },
    {
      path: "/singleplayer",
      name: "singleplayer",
      component: () => import("@/views/SinglePlayerView.vue"),
      meta: {
        robots: "index, follow",
        title: "Pixel Art Singleplayer Game & Daily Challenge | PixReveal",
        description:
          "Play 5 pixel art singleplayer modes, race against time, improve your high score, and solve the daily challenge directly in your browser.",
        canonical: "https://www.pixreveal.com/singleplayer",
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
      path: "/blur",
      name: "blur",
      component: () => import("@/views/BlurView.vue"),
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
      path: "/gameover-online",
      name: "gameover-online",
      component: () => import("@/views/GameOverOnlineView.vue"),
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
        title: "Jackbox-Style Local Party Game with Phones | PixReveal",
        description:
          "Use smartphones as controllers and play a free Jackbox-style pixel art party game on your TV or laptop with friends.",
        canonical: "https://www.pixreveal.com/play-party",
      },
    },
    {
      path: "/play-online",
      name: "play-online",
      component: () => import("@/views/PlayOnlineView.vue"),
      meta: {
        robots: "index, follow",
        title: "Online Pixel Art Multiplayer Game | PixReveal",
        description:
          "Host or join private online lobbies, compete with friends worldwide, and guess pixel art in real time from any device.",
        canonical: "https://www.pixreveal.com/play-online",
      },
    },
    {
      path: "/free-jackbox-alternative",
      name: "free-jackbox-alternative",
      component: () => import("@/views/FreeJackboxAlternativeView.vue"),
      meta: {
        robots: "index, follow",
        title: "Free Jackbox Alternative for TV & Phones | PixReveal",
        description:
          "Turn your smartphones into controllers! Host PixReveal on your TV or laptop and play the ultimate party game with your friends.",
        canonical: "https://www.pixreveal.com/free-jackbox-alternative",
      },
    },
    {
      path: "/free-skribbl-and-gartic-alternative",
      name: "free-skribbl-and-gartic-alternative",
      component: () => import("@/views/FreeGarticAlternativeView.vue"),
      meta: {
        robots: "index, follow",
        title: "Games Like Skribbl.io & Gartic Phone | PixReveal",
        description:
          "Tired of bad mouse drawings? PixReveal is the ultimate free alternative to Skribbl.io and Gartic Phone. Play this multiplayer pixel quiz directly in your browser!",
        canonical:
          "https://www.pixreveal.com/free-skribbl-and-gartic-alternative",
      },
    },
    {
      path: "/free-pixel-guessr-alternative",
      name: "free-pixel-guessr-alternative",
      component: () => import("@/views/FreePixelGuessrView.vue"),
      meta: {
        robots: "index, follow",
        title: "Free Games like Pixel Guessr | PixReveal",
        description:
          "Looking for a quiz game about guessing pixel drawings? Play this multiplayer pixel quiz directly in your browser!",
        canonical: "https://www.pixreveal.com/free-pixel-guessr-alternative",
      },
    },
    {
      path: "/picture-reveal-game",
      name: "picture-reveal-game",
      component: () => import("@/views/OnlineRevealGameView.vue"),
      meta: {
        robots: "index, follow",
        title: "Online Picture Reveal Game | PixReveal",
        description:
          "Looking for a quiz game about guessing a revealing image? Play PixReveal directly in your browser!",
        canonical: "https://www.pixreveal.com/picture-reveal-game",
      },
    },
    {
      path: "/friday-afterwork-game",
      name: "friday-afterwork-game",
      component: () => import("@/views/FridayGameView.vue"),
      meta: {
        robots: "index, follow",
        title: "Free Friday Afterwork Game for Teams | PixReveal",
        description:
          "Play PixReveal with your team. A free, safe-for-work picture reveal quiz for Friday afterwork. No login, no registration – start playing instantly in the browser.",
        canonical: "https://www.pixreveal.com/friday-afterwork-game",
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
        canonical: "https://www.pixreveal.com/about",
      },
    },
    {
      path: "/faq",
      name: "faq",
      component: () => import("@/views/FAQView.vue"),
      meta: {
        robots: "index, follow",
        title: "FAQ PixReveal",
        description: "Frequently Asked Questions about PixReveal.",
        canonical: "https://www.pixreveal.com/faq",
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
        canonical: "https://www.pixreveal.com/blog",
      },
    },
    {
      path: "/user-gallery",
      name: "gallery",
      component: () => import("@/views/GalleryView.vue"),
      meta: { robots: "noindex" },
    },
    {
      path: "/hall-of-fame",
      name: "hall-of-fame",
      component: () => import("@/views/HallOfFameView.vue"),
      meta: {
        robots: "index, follow",
        title: "PixReveal Hall of Fame - Daily Challenge Winners",
        description:
          "Check out the PixReveal Daily Champions! See who guessed the drawings with the highest score and learn how to secure your own place in the Hall of Fame.",
        canonical: "https://www.pixreveal.com/hall-of-fame",
      },
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
    "/blur",
    "/inspect",
    "/gravity",
    "/party-host",
    "/party-player",
  ];

  const needRounds = [
    "/classic",
    "/online",
    "/blur",
    "/inspect",
    "/gravity",
    "/party-host",
    "/daily",
  ];

  if (
    needRounds.includes(to.path) &&
    (!gameStore.rounds || gameStore.rounds.length <= 0 || gameStore.currentRoundIndex > 1)
  ) {
    return "/";
  }

  if (to.path === "/daily" && useDailyStore().hasPlayedToday) {
    return "/";
  }

  if (to.path === "/gameover-daily" && from.path !== "/daily") {
    return "/";
  }

  if (to.path === "/gameover-online" && from.path !== "/online") {
    return "/";
  }

  if (
    (to.path === "/gameover" ||
      to.path === "/gameover-online" ||
      to.path === "/gameover-party") &&
    !validPathsForGameOver.includes(from.path)
  ) {
    return "/";
  }

  if (
    (from.path === "/gameover" ||
      from.path === "/gameover-online" ||
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
      from.path === "/gameover-online" &&
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

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = String(to.meta.title);
  }

  let metaDescription = document.querySelector('meta[name="description"]');
  if (to.meta.description) {
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", String(to.meta.description));
  } else if (metaDescription) {
    metaDescription.remove();
  }

  let metaRobots = document.querySelector('meta[name="robots"]');
  if (to.meta.robots) {
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.setAttribute("name", "robots");
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute("content", String(to.meta.robots));
  } else if (metaRobots) {
    metaRobots.setAttribute("content", "index, follow");
  }

  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (to.meta.canonical) {
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", String(to.meta.canonical));
  } else if (canonicalLink) {
    canonicalLink.remove();
  }
});

export default router;
