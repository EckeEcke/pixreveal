import type { Ref } from "vue";

interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  text: string;
  avatarIndex?: number;
  isSystem: boolean;
  timestamp: string;
}

export interface UseChatEventsOptions {
  channel: any;
  messages: Ref<ChatMessage[]>;
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function useChatEvents({
  channel,
  messages,
}: UseChatEventsOptions): void {
  channel.bind(
    "client-chat-message",
    (data: Omit<ChatMessage, "isSystem" | "timestamp">) => {
      messages.value.push({
        ...data,
        isSystem: false,
        timestamp: formatTimestamp(),
      });
    },
  );
}
