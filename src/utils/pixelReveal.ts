export type RevealSeed = string | number;

// A local generator keeps the reveal independent of other random effects.
function seededRandom(seed: RevealSeed): () => number {
  let state = 2166136261;
  for (const char of String(seed)) {
    state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  }

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRevealSeed(): number {
  return Math.floor(Math.random() * 4294967296);
}

export function dailyRevealSeed(date: string, roundIndex: number): string {
  return `daily:${date}:${roundIndex}`;
}

export function createPixelReveal<T>(
  pixels: readonly T[],
  durationMs: number,
  startedAt: number,
  seed?: RevealSeed,
) {
  const order = [...pixels];
  const random = seed === undefined ? Math.random : seededRandom(seed);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }

  const duration = Math.max(0, durationMs);
  let revealedCount = 0;
  let pausedAt: number | null = null;
  let pausedMs = 0;

  return {
    get complete() {
      return revealedCount === order.length;
    },
    setPaused(paused: boolean, now: number) {
      if (paused && pausedAt === null) pausedAt = now;
      if (!paused && pausedAt !== null) {
        pausedMs += now - pausedAt;
        pausedAt = null;
      }
    },
    advance(now: number): Array<{ pixel: T; ageMs: number }> {
      const elapsed = Math.max(0, (pausedAt ?? now) - startedAt - pausedMs);
      const count = duration === 0
        ? order.length
        : Math.min(order.length, Math.floor((elapsed / duration) * order.length));
      const next = [];
      while (revealedCount < count) {
        const pixel = order[revealedCount++]!;
        // Preserve each pixel's animation age when a delayed frame catches up.
        const revealedAt = duration * (revealedCount / order.length);
        next.push({ pixel, ageMs: Math.max(0, elapsed - revealedAt) });
      }
      return next;
    },
  };
}
