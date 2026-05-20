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
import partyOverSound from "@/assets/audio/party-over.mp3";
import partyCorrectSound from "@/assets/audio/correct2.mp3";
import partyIncorrectSound from "@/assets/audio/incorrect2.mp3";
import shuffleSound from "@/assets/audio/shuffle.mp3";

export const useSoundStore = defineStore("sound", () => {
  const isAudioEnabled = ref(
    localStorage.getItem("pixreveal_audio") === "true",
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
    winner: winnerSound,
    party: partyOverSound,
    partyCorrect: partyCorrectSound,
    partyIncorrect: partyIncorrectSound,
  };

  type SoundName = keyof typeof sources;
  const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

  const getAudio = (name: SoundName) => {
    const existing = cache[name];
    if (existing) return existing;
    const audio = new Audio(sources[name]);
    audio.preload = "auto";
    cache[name] = audio;
    return audio;
  };

  const playSound = (name: SoundName) => {
    if (!isAudioEnabled.value) return;

    const audio = getAudio(name);
    audio.currentTime = 0;
    audio.play().catch((err) => {
      console.warn("Audio could not be played:", err);
    });
  };

  const stopSound = (name: SoundName) => {
    const audio = cache[name];
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const handleHoverSound = () => {
    if (window.matchMedia("(hover: hover)").matches) {
      playSound("hover");
    }
  };

  watch(isAudioEnabled, (newValue) => {
    localStorage.setItem("pixreveal_audio", newValue.toString());
  });

  window.addEventListener(
    "pointerdown",
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
