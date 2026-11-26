interface GameDataLoaders {
  daily: () => unknown;
  scores: () => unknown;
  userArt: () => unknown;
  defer: (load: () => unknown) => () => void;
}

// Marketing pages need no game data. Start the usual warmup once on leaving them.
export function createGameDataBootstrap(loaders: GameDataLoaders) {
  let started = false;
  let cancelDeferredLoad: (() => void) | undefined;

  return {
    enterRoute(isLandingPage: boolean) {
      if (isLandingPage || started) return;
      started = true;
      loaders.daily();
      loaders.scores();
      cancelDeferredLoad = loaders.defer(loaders.userArt);
    },
    dispose() {
      cancelDeferredLoad?.();
    },
  };
}
