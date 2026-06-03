import { ref } from "vue";
import { INACTIVITY_GRACE_MS } from "@/stores/channel.constants"

type InactivityCallbacks = {
  getIsHost: () => boolean;
  getGameRunning: () => boolean;
  getActiveChannel: () => any;
  getPlayerId: () => string;
  onInactive: (opts: { skipNavigation?: boolean; skipReset?: boolean }) => void;
};

export function useInactivity({
  getIsHost,
  getGameRunning,
  getActiveChannel,
  getPlayerId,
  onInactive,
}: InactivityCallbacks) {
  const inactivityNotified = ref(false);
  const inactivityGraceTimeoutId = ref<number | null>(null);

  const clearInactivityGrace = () => {
    if (!inactivityGraceTimeoutId.value) return;
    window.clearTimeout(inactivityGraceTimeoutId.value);
    inactivityGraceTimeoutId.value = null;
  };

  const handleInactivity = ({
    skipNavigation = false,
    skipReset = false,
  }: { skipNavigation?: boolean; skipReset?: boolean } = {}) => {
    if (
      inactivityNotified.value ||
      !getGameRunning() ||
      !getActiveChannel() ||
      !getPlayerId()
    ) {
      return;
    }
    inactivityNotified.value = true;

    const eventName = getIsHost()
      ? "client-host-inactive"
      : "client-player-inactive";
    getActiveChannel().trigger(eventName, { playerId: getPlayerId() });

    onInactive({ skipNavigation, skipReset });
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      clearInactivityGrace();
      return;
    }
    clearInactivityGrace();
    inactivityGraceTimeoutId.value = window.setTimeout(() => {
      inactivityGraceTimeoutId.value = null;
      handleInactivity();
    }, INACTIVITY_GRACE_MS);
  };

  const handleBeforeUnload = () => {
    handleInactivity({ skipNavigation: true });
  };

  const reset = () => {
    inactivityNotified.value = false;
    clearInactivityGrace();
  };

  return {
    inactivityNotified,
    clearInactivityGrace,
    handleInactivity,
    handleVisibilityChange,
    handleBeforeUnload,
    reset,
  };
}
