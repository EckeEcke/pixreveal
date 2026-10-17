import { defineStore } from "pinia";
import { ref, watch } from "vue";
import correctSound from "@/assets/audio/correct.mp3";
import incorrectSound from "@/assets/audio/incorrect.mp3";
import clickSound from "@/assets/audio/click.mp3";
import revealSound from "@/assets/audio/reveal2.mp3";
import completeSound from "@/assets/audio/complete.mp3";
import buzzSound from "@/assets/audio/buzz.mp3";
import timerSound from "@/assets/audio/timer.mp3";
import punchSound from "@/assets/audio/punch.mp3";
import hoverSound from "@/assets/audio/hover.mp3";
import backSound from "@/assets/audio/back.mp3";
import popSound from "@/assets/audio/pop.mp3";
import freezeSound from "@/assets/audio/freeze.mp3";
import electricitySound from "@/assets/audio/electricity.mp3";
import winnerSound from "@/assets/audio/winner.mp3";
import partyCorrectSound from "@/assets/audio/correct2.mp3";
import partyIncorrectSound from "@/assets/audio/incorrect2.mp3";
import shuffleSound from "@/assets/audio/shuffle.mp3";
import devilSound from "@/assets/audio/devil.mp3";
import fartSound from "@/assets/audio/fart.mp3";
import rewardSound from "@/assets/audio/reward.mp3";
import countingSound from "@/assets/audio/counting.mp3";
import robot1Sound from "@/assets/audio/robot-talk1.mp3";
import robot2Sound from "@/assets/audio/robot-talk2.mp3";
import robot3Sound from "@/assets/audio/robot-talk3.mp3";
import robot4Sound from "@/assets/audio/robot-talk4.mp3";

const partyOverSound = "/assets/audio/party-over.mp3";

export const useSoundStore = defineStore("sound", () => {
  const isAudioEnabled = ref(
    localStorage.getItem("pixreveal_audio") !== "false",
  );

  const sources = {
    correct: correctSound,
    incorrect: incorrectSound,
    click: clickSound,
    reveal: revealSound,
    complete: completeSound,
    buzz: buzzSound,
    timer: timerSound,
    punch: punchSound,
    hover: hoverSound,
    back: backSound,
    pop: popSound,
    freeze: freezeSound,
    shuffle: shuffleSound,
    electricity: electricitySound,
    devil: devilSound,
    fart: fartSound,
    reward: rewardSound,
    winner: winnerSound,
    party: partyOverSound,
    partyCorrect: partyCorrectSound,
    partyIncorrect: partyIncorrectSound,
    counting: countingSound,
    robot1: robot1Sound,
    robot2: robot2Sound,
    robot3: robot3Sound,
    robot4: robot4Sound,
  };

  type SoundName = keyof typeof sources;

  const ALL_SOUNDS = Object.keys(sources) as SoundName[];

  const PRIORITY_SOUNDS: SoundName[] = [
    "click",
    "hover",
    "back",
    "pop",
    "correct",
    "incorrect",
    "reveal",
    "timer",
  ];

  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;

  const rawCache: Partial<Record<SoundName, Promise<ArrayBuffer | null>>> = {};
  const buffers: Partial<Record<SoundName, AudioBuffer>> = {};
  const decoding: Partial<Record<SoundName, Promise<AudioBuffer | null>>> = {};
  const active: Partial<Record<SoundName, Set<AudioBufferSourceNode>>> = {};

  const getContext = (): AudioContext | null => {
    if (ctx) return ctx;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor({ latencyHint: "interactive" });
      master = ctx.createGain();
      master.connect(ctx.destination);
    } catch (err) {
      console.warn("AudioContext could not be created:", err);
      ctx = null;
      master = null;
    }
    return ctx;
  };

  const resumeContext = () => {
    const c = getContext();
    if (c && c.state !== "running") {
      c.resume().catch(() => {});
    }
  };

  const fetchRaw = (name: SoundName): Promise<ArrayBuffer | null> => {
    const cached = rawCache[name];
    if (cached) return cached;
    const promise = fetch(sources[name])
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .catch((err) => {
        console.warn(`Sound "${name}" could not be loaded:`, err);
        delete rawCache[name];
        return null;
      });
    rawCache[name] = promise;
    return promise;
  };

  const loadBuffer = (name: SoundName): Promise<AudioBuffer | null> => {
    const ready = buffers[name];
    if (ready) return Promise.resolve(ready);
    const pending = decoding[name];
    if (pending) return pending;

    const promise = (async () => {
      const c = getContext();
      if (!c) return null;
      const raw = await fetchRaw(name);
      if (!raw) return null;
      try {
        const buffer = await c.decodeAudioData(raw.slice(0));
        buffers[name] = buffer;
        return buffer;
      } catch (err) {
        console.warn(`Sound "${name}" could not be decoded:`, err);
        return null;
      } finally {
        delete decoding[name];
      }
    })();
    decoding[name] = promise;
    return promise;
  };

  const prefetchRaw = () => {
    PRIORITY_SOUNDS.forEach((name) => void fetchRaw(name));

    const rest = ALL_SOUNDS.filter((n) => !PRIORITY_SOUNDS.includes(n));
    const loadRest = () => rest.forEach((name) => void fetchRaw(name));
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(loadRest, { timeout: 4000 });
    } else {
      // Safari < 18 kennt requestIdleCallback nicht
      window.setTimeout(loadRest, 1500);
    }
  };

  let warmedUp = false;
  const warmUp = async () => {
    if (warmedUp) return;
    warmedUp = true;
    await Promise.all(PRIORITY_SOUNDS.map(loadBuffer));
    await Promise.all(
      ALL_SOUNDS.filter((n) => !PRIORITY_SOUNDS.includes(n)).map(loadBuffer),
    );
  };

  const stopSound = (name: SoundName) => {
    const set = active[name];
    if (!set) return;
    for (const node of Array.from(set)) {
      try {
        node.stop();
      } catch {
        // bereits beendet
      }
    }
    set.clear();
  };

  const stopAll = () => ALL_SOUNDS.forEach(stopSound);

  const start = (name: SoundName, buffer: AudioBuffer) => {
    const c = getContext();
    if (!c || !master) return;

    stopSound(name);

    const node = c.createBufferSource();
    node.buffer = buffer;
    node.connect(master);

    const set = (active[name] ??= new Set());
    set.add(node);
    node.onended = () => {
      set.delete(node);
      node.disconnect();
    };

    node.start(0);
  };

  const playSound = (name: SoundName) => {
    if (!isAudioEnabled.value) return;
    if (!getContext()) return;
    resumeContext();

    const buffer = buffers[name];
    if (buffer) {
      start(name, buffer);
      return;
    }

    void loadBuffer(name).then((loaded) => {
      if (loaded && isAudioEnabled.value) start(name, loaded);
    });
  };

  const handleHoverSound = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      playSound("hover");
    }
  };

  watch(isAudioEnabled, (newValue) => {
    localStorage.setItem("pixreveal_audio", newValue.toString());
    if (!newValue) stopAll();
  });

  prefetchRaw();

  const unlock = () => {
    resumeContext();
    void warmUp();
  };
  (["pointerdown", "keydown", "touchend"] as const).forEach((type) =>
    window.addEventListener(type, unlock, {
      once: true,
      capture: true,
      passive: true,
    }),
  );

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && ctx) resumeContext();
  });

  window.addEventListener(
    "click",
    (event: PointerEvent) => {
      const target = (event.target as Element).closest<HTMLElement>(
        "[data-sfx]",
      );

      if (!target || (target as any).disabled || !isAudioEnabled.value) {
        return;
      }

      const sfxType = target.dataset.sfx;
      if (sfxType) {
        playSound(sfxType as SoundName);
      }
    },
    { capture: true, passive: true },
  );

  window.addEventListener(
    "keydown",
    (event: KeyboardEvent) => {
      if (!isAudioEnabled.value) return;
      if (event.key !== "Enter" && event.keyCode !== 13) return;
      const target = (event.target as Element | null)?.closest?.<HTMLElement>(
        "[data-sfx]",
      );
      if (!target || (target as any).disabled) return;
      const sfxType = target.dataset.sfx;
      if (sfxType) playSound(sfxType as SoundName);
    },
    { capture: true },
  );

  return { isAudioEnabled, playSound, stopSound, handleHoverSound };
});