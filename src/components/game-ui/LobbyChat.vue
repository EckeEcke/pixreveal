<template>
  <div class="chat-wrapper">
    <div class="chat">
      <Icon icon="pixel:message-dots" class="chat-icon" @click="toggleChat" />
      <span v-if="hasMessages" class="notification-badge"></span>
      <div v-if="showChat" class="lobby-chat">
        <div class="messages-area" ref="scrollContainer">
          <div
            v-for="msg in channelStore.messages"
            :key="msg.id"
            :class="['chat-row', { 'system-msg': msg.isSystem }]"
          >
            <template v-if="!msg.isSystem">
              <span class="chat-user">[{{ msg.username }}]:</span>
              <span class="chat-text">{{ msg.text }}</span>
            </template>
            <template v-else>
              <span class="chat-system-text">>> {{ msg.text }}</span>
            </template>
          </div>
        </div>

        <div class="chat-footer">
          <input
            v-model="chatInput"
            @keyup.enter="handleSend"
            type="text"
            placeholder="Type a message..."
            class="chat-input"
          />
          <button @click="handleSend" class="btn-outline">
            <Icon icon="pixel:play-solid" />
            SEND
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from "vue";
import { Icon } from "@iconify/vue";
import { useSoundStore } from "@/stores/sound";
import { useChannelStore } from "@/stores/channel";

const channelStore = useChannelStore();
const soundStore = useSoundStore();
const chatInput = ref("");
const showChat = ref(false);
const messageCountOnOpen = ref(0);
const scrollContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  soundStore.playSound("pop");
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

const toggleChat = () => {
  showChat.value = !showChat.value;
  messageCountOnOpen.value = channelStore.messages.length;
};

const hasMessages = computed(
  () => channelStore.messages.length > messageCountOnOpen.value && !showChat.value
);

const handleSend = () => {
  if (chatInput.value.trim() === "") return;
  channelStore.sendChatMessage(chatInput.value);
  chatInput.value = "";
};

watch(
  () => channelStore.messages.length,
  () => {
    scrollToBottom();
  },
);

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.lobby-chat {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  background: rgba(30, 30, 30, 0.99);
  height: 200px;
  width: 100%;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-row {
  font-family: "Courier New", Courier, monospace;
  font-size: 13px;
  line-height: 1.4;
  word-break: break-all;
}

.chat-user {
  color: var(--primary);
  font-weight: bold;
  margin-right: 8px;
}

.chat-text {
  color: #eee;
}

.system-msg {
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 4px;
}

.chat-wrapper {
  position: fixed;
  right: 16px;
  bottom: 48px;
  width: 90%;
  max-width: 400px;
}

.chat-icon {
  background: black;
  padding: 4px;
  position: absolute;
  right: 6px;
  top: 6px;
  font-size: 32px;
  border-radius: 4px;
}

.chat-system-text {
  color: #777;
  font-style: italic;
  font-size: 11px;
}

.chat-footer {
  display: flex;
  background: #222;
  padding: 8px;
  gap: 8px;
}

.chat-input {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  color: #fff;
  font-family: inherit;
  outline: none;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.btn-outline {
  background: #000;
  width: 130px;
}

.messages-area::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-thumb {
  background: #444;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background-color: var(--primary);
  border-radius: 50%;
}

.notification-badge::after {
  content: "";
  position: absolute;
  top: 2;
  left: 2;
  width: 100%;
  height: 100%;
  background-color: var(--primary);
  border-radius: 50%;
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.chat {
  position: relative;
}
</style>
