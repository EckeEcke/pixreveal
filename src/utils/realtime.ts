export const isHostFlag = (value: any) =>
  value === true || value === 1 || value === "1" || value === "true";

export const backoffDelay = (baseMs: number, attempt: number, maxMs: number) =>
  Math.min(maxMs, baseMs * Math.pow(2, Math.max(0, attempt - 1)));

export const hashStringToRange = (value: string, range: number) => {
  if (range <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash % range;
};

