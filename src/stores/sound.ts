import { defineStore } from "pinia";
import { ref } from "vue";
import correctSound from "@/assets/audio/correct.wav";
import incorrectSound from "@/assets/audio/incorrect.mp3";
import clickSound from "@/assets/audio/click.mp3";
import revealSound from "@/assets/audio/click.mp3";
import completeSound from "@/assets/audio/complete.mp3";
import buzzSound from "@/assets/audio/buzz.wav";
import timerSound from "@/assets/audio/timer.wav"


export const useSoundStore = defineStore("sound", () => {
  const isAudioEnabled = ref(false);

  const sounds = {
    correct: new Audio(correctSound),
    incorrect: new Audio(incorrectSound),
    click: new Audio(clickSound),
    reveal: new Audio(revealSound),
    complete: new Audio(completeSound),
    buzz: new Audio(buzzSound),
    timer: new Audio(timerSound),
  };

  const playSound = (name: keyof typeof sounds) => {
    if (!isAudioEnabled.value) return;

    const audio = sounds[name];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch((err) => {
        console.warn("Audio could not be played:", err);
      });
    }
  };

  return { isAudioEnabled, playSound };
});
