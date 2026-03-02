import { ref, computed, type Ref } from 'vue'
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  const playerName: Ref<string | undefined> = ref(undefined)
  const avatarIndex: Ref<number |undefined> = ref(undefined)
  const points: Ref<number> = ref(0)

  const setUser = (user: { username: string; avatar: number }) => {
    playerName.value = user.username
    avatarIndex.value = user.avatar
  }

  const addPoints = (earnedPoints: number) => {
    points.value += earnedPoints
}

  return { playerName, avatarIndex, points, setUser, addPoints}
})