/// <reference lib="webworker" />

type TimerId = number;

type SetTimeoutMsg = { type: "setTimeout"; id: TimerId; delayMs: number };
type ClearTimeoutMsg = { type: "clearTimeout"; id: TimerId };
type SetIntervalMsg = { type: "setInterval"; id: TimerId; periodMs: number };
type ClearIntervalMsg = { type: "clearInterval"; id: TimerId };

type IncomingMsg =
  | SetTimeoutMsg
  | ClearTimeoutMsg
  | SetIntervalMsg
  | ClearIntervalMsg;

type TimeoutFiredMsg = { type: "timeoutFired"; id: TimerId };
type IntervalTickMsg = { type: "intervalTick"; id: TimerId };

const timeoutHandles = new Map<TimerId, number>();
const intervalHandles = new Map<TimerId, number>();

const post = (msg: TimeoutFiredMsg | IntervalTickMsg) => {
  self.postMessage(msg);
};

self.onmessage = (event: MessageEvent<IncomingMsg>) => {
  const data = event.data;

  switch (data.type) {
    case "setTimeout": {
      const handle = self.setTimeout(() => {
        timeoutHandles.delete(data.id);
        post({ type: "timeoutFired", id: data.id });
      }, Math.max(0, data.delayMs));
      timeoutHandles.set(data.id, handle);
      return;
    }
    case "clearTimeout": {
      const handle = timeoutHandles.get(data.id);
      if (handle !== undefined) {
        self.clearTimeout(handle);
        timeoutHandles.delete(data.id);
      }
      return;
    }
    case "setInterval": {
      const handle = self.setInterval(() => {
        post({ type: "intervalTick", id: data.id });
      }, Math.max(1, data.periodMs));
      intervalHandles.set(data.id, handle);
      return;
    }
    case "clearInterval": {
      const handle = intervalHandles.get(data.id);
      if (handle !== undefined) {
        self.clearInterval(handle);
        intervalHandles.delete(data.id);
      }
      return;
    }
  }
};
