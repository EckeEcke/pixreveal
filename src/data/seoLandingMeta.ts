export const blogRoute = {
  view: "src/views/BlogView.vue",
  meta: {
    staticContent: true,
    robots: "index, follow",
    title: "PixReveal Blog - Updates & News",
    description: "Stay up to date with the latest features, patch notes, and multiplayer announcements from PixReveal.",
    canonical: "https://www.pixreveal.com/blog",
  },
};

export const seoLandingRoutes = {
  "/free-jackbox-alternative": {
    view: "src/views/FreeJackboxAlternativeView.vue",
    meta: {
      seoLanding: true,
      robots: "index, follow",
      title: "Free Jackbox Alternative for TV & Phones | PixReveal",
      description: "Looking for a free game like Jackbox? Turn your smartphones into controllers and host PixReveal on your TV or laptop for your next party.",
      canonical: "https://www.pixreveal.com/free-jackbox-alternative",
    },
  },
  "/free-skribbl-and-gartic-alternative": {
    view: "src/views/FreeGarticAlternativeView.vue",
    meta: {
      seoLanding: true,
      robots: "index, follow",
      title: "Free Alternative to Skribbl.io & Gartic Phone | PixReveal",
      description: "Looking for a free Skribbl.io or Gartic Phone alternative? Guess pixel art as it appears, with no drawing needed. Play with friends in your browser.",
      canonical: "https://www.pixreveal.com/free-skribbl-and-gartic-alternative",
    },
  },
  "/free-pixel-guessr-alternative": {
    view: "src/views/FreePixelGuessrView.vue",
    meta: {
      seoLanding: true,
      robots: "index, follow",
      title: "Free Pixel Guessr Alternative – Play PixReveal Online",
      description: "Guess pixel art as the picture appears. Play PixReveal free in your browser, solo or with friends. No sign-up or download. Start your first game now.",
      canonical: "https://www.pixreveal.com/free-pixel-guessr-alternative",
    },
  },
  "/picture-reveal-game": {
    view: "src/views/OnlineRevealGameView.vue",
    meta: {
      seoLanding: true,
      robots: "index, follow",
      title: "Free Online Picture Reveal Game & Image Quiz | PixReveal",
      description: "Guess the hidden image as it appears pixel by pixel. Play PixReveal's free picture reveal game solo or with friends. No account or download needed.",
      canonical: "https://www.pixreveal.com/picture-reveal-game",
    },
  },
  "/phone-controller-party-game": {
    view: "src/views/PhoneControllerPartyGameView.vue",
    meta: {
      seoLanding: true,
      robots: "index, follow",
      title: "Free AirConsole Alternative – Phone Controller Party Game | PixReveal",
      description: "Looking for a free AirConsole alternative? Play PixReveal on your TV or laptop and use your phones as controllers. No app, no login, no download.",
      canonical: "https://www.pixreveal.com/phone-controller-party-game",
    },
  },
  "/friday-afterwork-game": {
    view: "src/views/FridayGameView.vue",
    meta: {
      seoLanding: true,
      robots: "index, follow",
      title: "Free Friday Afterwork Game for Teams & Coworkers | PixReveal",
      description: "Play a free Friday afterwork game with your coworkers. Guess pixel art on a shared office screen or in a private online lobby. No account or download.",
      canonical: "https://www.pixreveal.com/friday-afterwork-game",
    },
  },
} as const;
