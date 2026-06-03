import { ref } from "vue";
import {
  CONNECTION_LOSS_TIMEOUT_MS,
  FORCE_RECONNECT_COOLDOWN_MS,
  CONNECT_WATCHDOG_MS,
} from "@/stores/channel.constants";

type ConnectionStateCallbacks = {
  getIsLoading: () => boolean;
  setIsLoading: (v: boolean, text?: string) => void;
  getMode: () => "regular" | "party";
  getGameRunning: () => boolean;
  getPlayerId: () => string;
  getActiveChannel: () => any;
  onConnectionLost: () => void;
};

export function useConnectionState({
  getIsLoading,
  setIsLoading,
  getMode,
  getGameRunning,
  getPlayerId,
  getActiveChannel,
  onConnectionLost,
}: ConnectionStateCallbacks) {
  const connectionState = ref<string>("unknown");
  const connectWatchdogTimeoutId = ref<number | null>(null);
  const lastForceReconnectAt = ref<number>(0);
  const connectionLossTimeoutId = ref<number | null>(null);

  // Exposed so the caller can trigger a forced reconnect from the watchdog.
  let _forceReconnect: (() => void) | null = null;
  const setForceReconnect = (fn: () => void) => {
    _forceReconnect = fn;
  };

  const clearConnectWatchdog = () => {
    if (!connectWatchdogTimeoutId.value) return;
    window.clearTimeout(connectWatchdogTimeoutId.value);
    connectWatchdogTimeoutId.value = null;
  };

  const scheduleConnectWatchdog = () => {
    clearConnectWatchdog();
    connectWatchdogTimeoutId.value = window.setTimeout(() => {
      connectWatchdogTimeoutId.value = null;
      if (connectionState.value !== "connecting") return;
      const now = Date.now();
      if (now - lastForceReconnectAt.value < FORCE_RECONNECT_COOLDOWN_MS)
        return;
      lastForceReconnectAt.value = now;
      _forceReconnect?.();
    }, CONNECT_WATCHDOG_MS);
  };

  const clearConnectionLossTimeout = () => {
    if (!connectionLossTimeoutId.value) return;
    window.clearTimeout(connectionLossTimeoutId.value);
    connectionLossTimeoutId.value = null;
  };

  const createStateChangeHandler = () => {
    return ({ current }: { previous: string; current: string }) => {
      connectionState.value = current ?? "unknown";

      if (current === "connected") {
        clearConnectWatchdog();
        clearConnectionLossTimeout();
        if (getIsLoading()) {
          setIsLoading(false);
        }
        if (getMode() === "party" && getGameRunning() && getActiveChannel()) {
          getActiveChannel().trigger("client-party-state-request", {
            requestedBy: getPlayerId(),
          });
        }
        return;
      }

      if (current === "disconnected" || current === "unavailable") {
        clearConnectWatchdog();
        if (!getIsLoading()) {
          setIsLoading(true, "RECONNECTING...");
        }
        clearConnectionLossTimeout();
        connectionLossTimeoutId.value = window.setTimeout(() => {
          connectionLossTimeoutId.value = null;
          onConnectionLost();
        }, CONNECTION_LOSS_TIMEOUT_MS);
      }

      if (current === "connecting") {
        scheduleConnectWatchdog();
      }
    };
  };

  const reset = () => {
    clearConnectWatchdog();
    clearConnectionLossTimeout();
    connectionState.value = "unknown";
  };

  return {
    connectionState,
    createStateChangeHandler,
    clearConnectWatchdog,
    clearConnectionLossTimeout,
    setForceReconnect,
    reset,
  };
}
