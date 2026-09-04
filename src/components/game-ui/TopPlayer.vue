<template>
  <div v-if="topRanking" class="top-player-block">
    <div class="block-heading">
      <Icon icon="pixel:star-solid" class="daily-icon" />
      Daily Challenge leader
    </div>

    <div class="top-player-row">
      <router-link to="/rankings-daily" class="row-link">
        <div class="hud-avatar" :style="avatarStyle"></div>

        <div class="row-info">
          <span class="row-name">{{ topRanking.name }}</span>
        </div>

        <div class="row-divider"></div>

        <div class="row-score">
          <Icon icon="pixel:star-solid" class="star-icon" />
          <span>{{ topRanking.score }}</span>
        </div>
      </router-link>

      <button v-if="!dailyStore.hasPlayedToday" class="row-cta" data-sfx="click" @click="startDaily">
        <span>Beat them</span>
        <Icon icon="pixel:arrow-right-solid" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import avatarSheet from "@/assets/avatars/avatars.webp";
import type { CSSProperties } from "vue";
import { useDailyStore } from "@/stores/daily";
import { useGameStore } from "@/stores/game";
import { usePlayerStore } from "@/stores/player";

const router = useRouter();
const dailyStore = useDailyStore();
const playerStore = usePlayerStore();
const { prepareGame } = useGameStore();

type DailyRanking = {
  name: string;
  score: number;
  avatarIndex: number;
};

const topRanking = computed<DailyRanking | null>(() => {
  const list = Array.isArray(dailyStore.dailyRankings)
    ? (dailyStore.dailyRankings as DailyRanking[])
    : [];
  if (!list.length) return null;
  return [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0] ?? null;
});

const avatarStyle = computed<CSSProperties>(() => {
  const index = topRanking.value?.avatarIndex || 0;
  const col = index % 6;
  const row = Math.floor(index / 6);
  const x = col * 20;
  const y = row * 20;
  return {
    backgroundImage: `url(${avatarSheet})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: "600%",
    imageRendering: "pixelated" as CSSProperties["imageRendering"],
  };
});

const startDaily = () => {
  prepareGame(10, dailyStore.dailyRounds);
  playerStore.gameMode = dailyStore.mode;
  if (dailyStore.hasPlayedToday) {
    router.push("/rankings-daily");
  } else {
    router.push("/daily");
  }
};
</script>

<style scoped>
.top-player-block {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.7);
  margin-bottom: 4px;
}

.daily-icon {
  color: var(--neon-yellow, #ffb020);
  font-size: 15px;
  flex: 0 0 auto;
}

.top-player-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15);
}

.row-link {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1 1 auto;
  text-decoration: none;
}

.hud-avatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  flex: 0 0 auto;
  background-color: #2d3748;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
}

.row-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.row-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
}

.row-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(255, 255, 255, 0.1);
  flex: 0 0 auto;
}

.row-score {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex: 0 0 auto;
  white-space: nowrap;
}

.star-icon {
  color: var(--neon-yellow);
  filter: drop-shadow(0 0 4px var(--neon-yellow));
  font-size: 16px;
}

.row-cta {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-display);
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s all;
  white-space: nowrap;
}

.row-cta:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Unter ~360px: Divider raus, CTA wird eigene volle Zeile
   statt sich mit Avatar/Name/Score in eine Reihe zu quetschen */
@container (max-width: 360px) {
  .top-player-row {
    flex-wrap: wrap;
  }

  .row-divider {
    display: none;
  }

  .row-cta {
    flex: 1 1 100%;
    justify-content: center;
  }
}

/* Ab ~480px Container-Breite: Zeile hat sichtbar Platz (breite
   Bento-Kachel/Desktop), also Avatar/Schrift/Badges hochskalieren
   statt bei den kompakten Mobile-Maßen zu bleiben */
@container (min-width: 480px) {
  .top-player-row {
    gap: 18px;
    padding: 16px 22px;
  }

  .row-link {
    gap: 18px;
  }

  .hud-avatar {
    width: 44px;
    height: 44px;
    border-radius: 8px;
  }

  .block-heading {
    font-size: 15px;
  }

  .daily-icon {
    font-size: 17px;
  }

  .row-name {
    font-size: 20px;
  }

  .row-score {
    font-size: 20px;
    gap: 6px;
  }

  .star-icon {
    font-size: 22px;
  }

  .row-cta {
    font-size: 15px;
    padding: 10px 16px;
    gap: 8px;
  }
}
</style>