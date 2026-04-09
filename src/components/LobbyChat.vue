<template>
  <div class="lobby-chat">
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
        @input="soundStore.playSound('click')"
      />
      <button @click="handleSend" data-sfx="click" class="btn-outline">
        <Icon icon="pixel:play-solid" />
        SEND
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from "vue";
import { useOnlineStore } from "@/stores/online";
import { Icon } from "@iconify/vue";
import { useSoundStore } from "@/stores/sound";
import { useChannelStore } from "@/stores/channel";

const onlineStore = useOnlineStore();
const channelStore = useChannelStore();
const soundStore = useSoundStore();
const chatInput = ref("");
const scrollContainer = ref<HTMLElement | null>(null);

const scrollToBottom = async () => {
  await nextTick();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
};

const handleSend = () => {
  if (chatInput.value.trim() === "") return;
  channelStore.sendChatMessage(chatInput.value);
  chatInput.value = "";
};

watch(
  () => channelStore.messages.length,
  () => {
    scrollToBottom();
  }
);

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.lobby-chat {
  display: flex;
  flex-direction: column;
  border: 2px solid #333;
  border-radius: 8px;
  background: rgba(10, 10, 10, 0.8);
  height: 200px;
  width: 100%;
  overflow: hidden;
  margin: 32px auto;
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
  border: 1px solid #444;
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
</style>
