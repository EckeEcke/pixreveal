type TimerId = number;

type WorkerMsg =
  | { type: "timeoutFired"; id: TimerId }
  | { type: "intervalTick"; id: TimerId };

let worker: Worker | null = null;
let nextId = 1;

const timeoutCallbacks = new Map<TimerId, () => void>();
const intervalCallbacks = new Map<TimerId, () => void>();

const getWorker = () => {
  if (worker) return worker;

  worker = new Worker(new URL("../workers/timer.worker.ts", import.meta.url), {
    type: "module",
  });

  worker.onmessage = (event: MessageEvent<WorkerMsg>) => {
    const msg = event.data;
    if (msg.type === "timeoutFired") {
      const cb = timeoutCallbacks.get(msg.id);
      timeoutCallbacks.delete(msg.id);
      cb?.();
      return;
    }
    if (msg.type === "intervalTick") {
      intervalCallbacks.get(msg.id)?.();
    }
  };

  return worker;
};

const allocId = (): TimerId => nextId++;

export const workerSetTimeout = (cb: () => void, delayMs: number): TimerId => {
  const id = allocId();
  timeoutCallbacks.set(id, cb);
  getWorker().postMessage({ type: "setTimeout", id, delayMs });
  return id;
};

export const workerClearTimeout = (id: TimerId | null) => {
  if (!id) return;
  timeoutCallbacks.delete(id);
  getWorker().postMessage({ type: "clearTimeout", id });
};

export const workerSetInterval = (
  cb: () => void,
  periodMs: number,
): TimerId => {
  const id = allocId();
  intervalCallbacks.set(id, cb);
  getWorker().postMessage({ type: "setInterval", id, periodMs });
  return id;
};

export const workerClearInterval = (id: TimerId | null) => {
  if (!id) return;
  intervalCallbacks.delete(id);
  getWorker().postMessage({ type: "clearInterval", id });
};

