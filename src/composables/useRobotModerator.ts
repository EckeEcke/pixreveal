import { ref } from "vue";
import { useSoundStore } from "@/stores/sound";

export function useRobotModerator() {
  const soundStore = useSoundStore();
  const robotIsTalking = ref(false);
  const robotSounds = ["robot1", "robot2", "robot3", "robot4"] as const;
  const robotSoundIndex = ref(0);
  let robotTalkTimeoutId: number | null = null;

  const clearRobotTalkTimeout = () => {
    if (!robotTalkTimeoutId) return;
    window.clearTimeout(robotTalkTimeoutId);
    robotTalkTimeoutId = null;
  };

  const triggerRobotTalk = (duration = 1000) => {
    robotSoundIndex.value = (robotSoundIndex.value + 1) % robotSounds.length;
    clearRobotTalkTimeout();
    robotIsTalking.value = true;
    soundStore.playSound(robotSounds[robotSoundIndex.value] as any);

    robotTalkTimeoutId = window.setTimeout(() => {
      robotTalkTimeoutId = null;
      robotIsTalking.value = false;
    }, duration);
  };

  const playPop = () => {
    soundStore.playSound("pop");
  };

  return {
    robotIsTalking,
    triggerRobotTalk,
    playPop,
  };
}
