<template>
  <section ref="manualRoot" class="setup-card manual" aria-labelledby="manual-title">
    <button type="button" @click="$emit('close')" data-sfx="back" class="close-btn" aria-label="Close how to play">
      <Icon icon="pixel:window-close-solid" />
    </button>

    <header class="manual-header">
      <p class="eyebrow">PIXREVEAL MANUAL</p>
      <h2 id="manual-title">HOW TO PLAY</h2>
      <p class="manual-description">PixReveal is a free browser party game about guessing pixel art. Play solo or with friends, with no download needed.</p>
    </header>

    <nav class="manual-nav" aria-label="Manual sections">
      <a v-for="link in sectionLinks" :key="link.id" :href="`#${link.id}`" @click.prevent="goToSection(link.id)">{{ link.label }}</a>
    </nav>

    <article class="manual-body">
      <section id="manual-basics" class="manual-section" tabindex="-1" aria-labelledby="basics-heading">
        <div class="section-heading"><span aria-hidden="true">01</span><h2 id="basics-heading">The basics</h2></div>
        <p>Choose from four answers by tapping or clicking a button. On a keyboard, you can also use <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> or <kbd>4</kbd>. You get one answer per drawing. In Party Mode, buzz in first to get your chance to answer.</p>
        <StepsComponent compact />
      </section>

      <section id="manual-modes" class="manual-section" tabindex="-1" aria-labelledby="modes-heading">
        <div class="section-heading"><span aria-hidden="true">02</span><h2 id="modes-heading">Solo game modes</h2></div>
        <div class="modes-grid">
          <section v-for="mode in modes" :key="mode.name" class="mode-guide" :class="{ 'mode-guide--daily': mode.daily }" :style="{ '--mode-color': mode.color }">
            <h3><Icon :icon="mode.icon" aria-hidden="true" />{{ mode.name }}</h3>
            <p>{{ mode.description }}</p>
          </section>
        </div>
      </section>

      <section id="manual-multiplayer" class="manual-section" tabindex="-1" aria-labelledby="multiplayer-heading">
        <div class="section-heading"><span aria-hidden="true">03</span><h2 id="multiplayer-heading">Play with friends</h2></div>
        <div class="multiplayer-grid">
          <section class="multiplayer-guide">
            <h3><Icon icon="pixel:globe-solid" aria-hidden="true" />Online Multiplayer</h3>
            <p>Host a private room and invite your friends. Everyone plays the same drawings on their own screen. Earlier correct answers earn more points.</p>
            <h4>Invite your friends</h4>
            <ul class="invite-options">
              <li>Enter the room ID</li>
              <li>Copy an invite link</li>
              <li>Use your device’s share menu</li>
              <li>Scan the QR code</li>
            </ul>
          </section>
          <section class="multiplayer-guide">
            <h3><Icon icon="pixel:users-solid" aria-hidden="true" />Party Mode</h3>
            <p>Gather around one host screen and join with your phones. Watch the drawing on the big screen, hit your buzzer and choose an answer on your phone.</p>
            <p>After each round, one last-placed player receives a random powerup. A tie is decided randomly. Hold up to <strong>three powerups</strong>; a fourth replaces the oldest one.</p>
            <p>Send emotes from your phone to react on the host screen. Bonus rounds and the final round double both points and penalties.</p>
          </section>
        </div>
        <PowerUpInfo class="manual-powerups" />
      </section>

      <div class="extras-grid">
        <section id="manual-art" class="manual-section" tabindex="-1" aria-labelledby="art-heading">
          <div class="section-heading"><span aria-hidden="true">04</span><h2 id="art-heading">Create your own art</h2></div>
          <p>Draw pixel art in the <router-link to="/editor" @click="$emit('close')">Editor</router-link> and submit it for others to guess. Once approved, it can appear in solo and multiplayer games when user art is enabled in the settings.</p>
          <p>Find approved community drawings in the <router-link to="/user-gallery" @click="$emit('close')">User Art Gallery</router-link>.</p>
        </section>
        <section id="manual-unlockables" class="manual-section" tabindex="-1" aria-labelledby="unlockables-heading">
          <div class="section-heading"><span aria-hidden="true">05</span><h2 id="unlockables-heading">Achievements & unlockables</h2></div>
          <p>Complete achievements to unlock bonus avatars, avatar effects and player name effects.</p>
          <p>Open your avatar in the page header to check your progress and choose your unlocked cosmetics.</p>
        </section>
      </div>

      <section id="manual-settings" class="manual-section" tabindex="-1" aria-labelledby="settings-heading">
        <div class="section-heading"><span aria-hidden="true">06</span><h2 id="settings-heading">Settings</h2></div>
        <div class="settings-grid">
          <section>
            <h3>Drawing mix</h3>
            <p>Choose General for objects, people, nature and food; Nerdy for gaming, anime, cartoons, movies and TV; or Mixed for all categories. You can also include approved user art.</p>
          </section>
          <section>
            <h3>Rounds & timer</h3>
            <p>For games with a set number of rounds, choose 5, 10, 15 or 20 drawings and a round timer of 5, 10, 15 or 20 seconds. Sound and fullscreen controls are in the page header.</p>
          </section>
        </div>
      </section>
    </article>

    <div class="manual-actions">
      <ButtonSecondary @clicked="$emit('close')" data-sfx="back">Back to game</ButtonSecondary>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue"
import { Icon } from "@iconify/vue"
import ButtonSecondary from "@/components/page-ui/ButtonSecondary.vue"
import PowerUpInfo from "../game-ui/PowerUpInfo.vue"
import StepsComponent from "../page-ui/StepsComponent.vue"

defineEmits(["close"])
const manualRoot = ref(null)
const sectionLinks = [
  { id: "manual-basics", label: "Basics" },
  { id: "manual-modes", label: "Solo modes" },
  { id: "manual-multiplayer", label: "Multiplayer" },
  { id: "manual-art", label: "Your art" },
  { id: "manual-unlockables", label: "Unlockables" },
  { id: "manual-settings", label: "Settings" },
]
const goToSection = (id) => {
  const section = manualRoot.value?.querySelector(`#${id}`)
  section?.scrollIntoView({ block: "start" })
  section?.focus({ preventScroll: true })
}
const modes = [
  { name: "Classic Reveal", icon: "pixel:sparkles", color: "var(--primary)", description: "Identify the drawing as pixels appear at random. The more time remains when you answer correctly, the more stars you earn." },
  { name: "Gravity", icon: "pixelarticons:blocks", color: "var(--neon-mint)", description: "Pixels fall into place from above. Recognize the picture and choose the correct answer as early as you can to earn more points." },
  { name: "Inspect", icon: "pixel:search", color: "var(--neon-cyan)", description: "The complete drawing is hidden in darkness. Move your lens with a finger or mouse to inspect different parts of the image." },
  { name: "Survival", icon: "pixel:hockey-mask-solid", color: "var(--neon-error)", description: "Start with 30 seconds. A correct answer adds 3 seconds; a wrong answer costs 5. Solve as many drawings as you can and beat your local highscore." },
  { name: "Daily Challenge", icon: "pixel:calendar-solid", color: "var(--neon-yellow)", daily: true, description: "Play a new set of drawings every day. Everyone gets the same set, so you can compare your score on the daily leaderboard." },
]
</script>

<style scoped>
.setup-card.manual {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: 700px;
  padding: 32px 20px;
  background: rgba(15, 12, 29, 0.75);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4);
  border-radius: 8px;
}

.manual-header { padding-right: 24px; }
.eyebrow { margin: 0 0 6px; color: var(--primary); font-size: 12px; font-weight: 800; letter-spacing: 1px; }
.manual-header h2 { margin: 0; font-family: inherit; font-size: 28px; font-weight: 900; line-height: 1.2; text-align: left; text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.6); }
.manual-description { margin: 16px 0 0; max-width: 60ch; color: rgba(255, 255, 255, 0.8); }
.manual-nav { display: flex; flex-wrap: wrap; gap: 4px 16px; margin: 24px 0 32px; padding-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); }
.manual-nav a { display: inline-flex; align-items: center; min-height: 40px; font-size: 13px; text-decoration: none; color: rgba(255, 255, 255, 0.75); }
.manual-nav a:hover { color: var(--primary); }
.manual-body { display: grid; gap: 32px; }
.manual-section { min-width: 0; scroll-margin-top: 24px; display: grid; align-content: start; gap: 16px; }
.manual-body > .manual-section + .manual-section,
.extras-grid,
.extras-grid + .manual-section { padding-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.section-heading { display: flex; align-items: baseline; gap: 12px; }
.section-heading > span { color: var(--primary); font-size: 12px; font-weight: 700; flex-shrink: 0; }
h2 { margin: 0; font-size: 21px; line-height: 1.35; }
h3 { margin: 0 0 10px; font-size: 17px; line-height: 1.4; }
h4 { margin: 20px 0 10px; font-size: 14px; }
p, li { font-size: 14px; line-height: 1.65; }
p { margin: 0; }
p + p { margin-top: 12px; }
a { color: var(--primary); font-weight: 700; }
a:focus-visible, button:focus-visible { outline: 2px solid var(--primary); outline-offset: 4px; }
.manual-section:focus { outline: none; }
kbd { display: inline-block; min-width: 20px; padding: 1px 4px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; background: rgba(255, 255, 255, 0.05); text-align: center; font-family: inherit; font-size: 12px; }
.modes-grid, .multiplayer-grid, .extras-grid, .settings-grid { display: grid; gap: 24px; min-width: 0; }
.mode-guide { min-width: 0; }
.mode-guide h3, .multiplayer-guide > h3 { display: flex; align-items: center; gap: 10px; }
.mode-guide h3 { color: var(--mode-color); }
.mode-guide h3 svg, .multiplayer-guide > h3 svg { flex-shrink: 0; font-size: 22px; }
.mode-guide p, .multiplayer-guide p, .settings-grid p { color: rgba(255, 255, 255, 0.8); }
.invite-options { margin: 0; padding-left: 20px; }
.invite-options li + li { margin-top: 6px; }
.manual-powerups { margin-top: 8px; }
.manual-powerups :deep(.title) { margin-bottom: 16px; font-size: 17px; text-shadow: none; }
.manual-actions { display: flex; justify-content: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.1); }

@media (min-width: 600px) {
  .setup-card.manual { padding: 40px 32px 32px; }
  .manual-header h2 { font-size: 32px; }
  .modes-grid, .multiplayer-grid, .extras-grid, .settings-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 32px; }
  .mode-guide { padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; background: rgba(255, 255, 255, 0.025); }
  .mode-guide--daily { grid-column: 1 / -1; }
}

@media (min-width: 1024px) {
  .setup-card.manual { max-width: 1000px; }
  .manual-nav { gap: 8px 28px; }
  .manual-body { gap: 40px; }
  .manual-powerups :deep(.grid) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .multiplayer-grid, .extras-grid, .settings-grid { column-gap: 48px; }
}
</style>
