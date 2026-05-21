<template>
<ul class="howto-list">
        <li>
          <Icon
            icon="streamline-pixel:video-movies-vintage-tv-1"
            class="icon"
          />
          Host on a big screen
        </li>
        <li>
          <Icon
            icon="streamline-pixel:interface-essential-touch-id-smartphone"
            class="icon"
          />
          Play via phone.
        </li>
        <li>
          <Icon icon="streamline-pixel:phone-scan-qr-code-1" class="icon" />
          Use QR code, room id or link to join.
        </li>
        <li>
          <Icon
            icon="streamline-pixel:interface-essential-dial-pad-finger-2"
            class="icon"
          />
          Buzz to answer.
        </li>
        <li>
          <Icon
            icon="streamline-pixel:business-products-magic-rabbit"
            class="icon"
          />
          Bonus rounds with special rulesets
        </li>
        <li>
          <Icon
            icon="streamline-pixel:entertainment-events-hobbies-bomb"
            class="icon"
          />
          Use powerups to sabotage your friends.
        </li>
      </ul>

      <PowerUpInfo class="powerups" />
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import PowerUpInfo from '../game-ui/PowerUpInfo.vue';
</script>

<style scoped>
.howto-list {
  margin: 32px 0;
  padding-left: 0;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 700;
  font-size: 18px;
  list-style-type: none;
}

.howto-list li {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.icon {
  font-weight: 400;
  font-size: 44px;
  color: var(--primary);
}

.powerups {
  margin-top: 16px;
  margin-left: 0 !important;
}
</style>