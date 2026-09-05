import { ref, readonly } from "vue";

const TWITCH_IRC_URL = "wss://irc-ws.chat.twitch.tv:443";

type TwitchMessage = {
  author: string;
  text: string;
  publishedAt: string;
};

export function useTwitchChat() {
  const connected = ref(false);
  let socket: WebSocket | null = null;
  let reconnectHandle: number | null = null;
  let active = false;
  let currentChannel = "";

  function stop() {
    active = false;
    if (reconnectHandle !== null) {
      window.clearTimeout(reconnectHandle);
      reconnectHandle = null;
    }
    socket?.close();
    socket = null;
    connected.value = false;
  }

  function start(
    channelName: string,
    onMessage: (message: TwitchMessage) => void,
    onStatus?: (message: string) => void,
  ) {
    stop();
    currentChannel = channelName.trim().replace(/^#/, "").toLowerCase();
    if (!currentChannel) {
      onStatus?.("Enter a Twitch channel name first.");
      return;
    }

    active = true;

    const connect = () => {
      if (!active) return;
      const nextSocket = new WebSocket(TWITCH_IRC_URL);
      socket = nextSocket;

      nextSocket.onopen = () => {
        if (!active || socket !== nextSocket) return;
        nextSocket.send("CAP REQ :twitch.tv/tags twitch.tv/commands");
        nextSocket.send("PASS SCHMOOPIIE");
        nextSocket.send(
          `NICK justinfan${Math.floor(10000 + Math.random() * 90000)}`,
        );
        nextSocket.send(`JOIN #${currentChannel}`);
        connected.value = true;
        onStatus?.(`Connected to Twitch chat #${currentChannel}.`);
      };

      nextSocket.onmessage = (event) => {
        if (!active || socket !== nextSocket) return;
        const raw = String(event.data || "");
        for (const line of raw.split("\r\n")) {
          if (!active || socket !== nextSocket) return;
          if (line.startsWith("PING ")) {
            nextSocket.send(line.replace("PING", "PONG"));
            continue;
          }

          const match = line.match(
            /^(?:@([^ ]+) )?:([^!]+)![^ ]+ PRIVMSG #[^ ]+ :(.*)$/,
          );
          if (!match) continue;

          const tags = Object.fromEntries(
            (match[1] || "")
              .split(";")
              .filter(Boolean)
              .map((tag) => {
                const [key, ...value] = tag.split("=");
                return [key, value.join("=")];
              }),
          );
          onMessage({
            author: tags["display-name"] || match[2] || "anon",
            text: match[3] || "",
            publishedAt: new Date().toISOString(),
          });
        }
      };

      nextSocket.onerror = () => {
        if (!active || socket !== nextSocket) return;
        onStatus?.("Twitch chat connection error.");
      };

      nextSocket.onclose = () => {
        if (socket !== nextSocket) return;
        socket = null;
        connected.value = false;
        if (!active) return;
        onStatus?.("Twitch chat disconnected; reconnecting...");
        reconnectHandle = window.setTimeout(connect, 5000);
      };
    };

    connect();
  }

  return {
    connected: readonly(connected),
    start,
    stop,
  };
}

export default useTwitchChat;
