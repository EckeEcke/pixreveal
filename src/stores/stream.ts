import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'pixreveal:stream_players'

type StreamPlayer = {
  id: string
  username: string
  stars: number
  points: number
}

export const useStreamStore = defineStore('stream', () => {
  const players = ref<Record<string, StreamPlayer>>({})

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        players.value = parsed
      }
    } catch (e) {
      console.warn('Failed to load stream players from storage', e)
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players.value))
    } catch (e) {
      console.warn('Failed to save stream players to storage', e)
    }
  }

  loadFromStorage()

  function ensurePlayer(username: string) {
    const key = username.trim().toLowerCase()
    if (!players.value[key]) {
      players.value[key] = { id: crypto?.randomUUID?.() ?? key + Math.random().toString(36).slice(2), username: username, stars: 0, points: 0 }
      saveToStorage()
    }
    return players.value[key]
  }

  function addStars(username: string, stars: number) {
    const p = ensurePlayer(username)
    p.stars += stars
    saveToStorage()
  }

  function addPoint(username: string, amount = 1) {
    const p = ensurePlayer(username)
    p.points += amount
    saveToStorage()
  }

  function resetAll() {
    players.value = {}
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) { /* ignore */ }
  }

  const leaderboard = computed(() => {
    return Object.values(players.value).slice().sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      return b.stars - a.stars
    })
  })

  return {
    players,
    ensurePlayer,
    addStars,
    addPoint,
    resetAll,
    leaderboard,
  }
})

export default useStreamStore
