const hasVibrationSupport = (): boolean =>
  typeof window !== "undefined" && typeof window.navigator?.vibrate === "function";

const vibrate = (pattern: number | number[]): void => {
  if (!hasVibrationSupport()) return;
  window.navigator.vibrate(pattern);
};

export const vibrateBuzz = (): void => {
  vibrate(50);
};

export const vibrateSuccess = (): void => {
  vibrate([20, 30, 20]);
};

export const vibrateError = (): void => {
  vibrate([10, 20, 10, 20, 10]);
};

export const vibratePulse = (): void => {
  vibrate([5, 10, 5, 10, 5]);
};
