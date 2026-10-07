import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { useGameStore } from "./game"
import { usePlayerStore } from "./player"
import { useConfigStore } from "./config"
import type { Round } from "@/types/game"
import type { AvatarSpriteSheet } from "@/utils/avatar"

export type ChallengeParticipant = {
  playerId?: string
  username: string
  avatarIndex: number
  avatarSpriteSheet?: AvatarSpriteSheet
  score: number
  answerHistory: boolean[]
}

export type ChallengeSession = {
  sessionId: string
  mode: "classic" | "inspect" | "gravity"
  revealTime: number
  rounds: Round[]
  challenger: ChallengeParticipant
  opponent: ChallengeParticipant | null
}

export type StoredChallenge = {
  sessionId: string
  link: string
  score: number
  mode: "classic" | "inspect" | "gravity"
  createdAt: number
  expiresAt: number
  hasOpponent?: boolean
}

const DB_NAME = "pixreveal_challenges_db"
const STORE_NAME = "challenges"
const SESSION_STORE_NAME = "active_session"

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "sessionId" })
      }
      if (!db.objectStoreNames.contains(SESSION_STORE_NAME)) {
        db.createObjectStore(SESSION_STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const saveToIndexedDB = async (storeName: string, key: string, value: any) => {
  try {
    const db = await openDatabase()
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    store.put(value, key)
  } catch (error) {
    console.error("Could not save to IndexedDB", error)
  }
}

const getFromIndexedDB = async (storeName: string, key: string): Promise<any> => {
  try {
    const db = await openDatabase()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly")
      const store = tx.objectStore(storeName)
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error("Could not read from IndexedDB", error)
    return null
  }
}

const removeFromIndexedDB = async (storeName: string, key: string) => {
  try {
    const db = await openDatabase()
    const tx = db.transaction(storeName, "readwrite")
    const store = tx.objectStore(storeName)
    store.delete(key)
  } catch (error) {
    console.error("Could not remove from IndexedDB", error)
  }
}

export const useChallengeStore = defineStore("challenge", () => {
  const gameStore = useGameStore()
  const playerStore = usePlayerStore()
  const configStore = useConfigStore()
  const session = ref<ChallengeSession | null>(null)
  const active = computed(() => Boolean(session.value))

  const loadStored = async () => {
    const storedSession = await getFromIndexedDB(SESSION_STORE_NAME, "current")
    if (storedSession) {
      session.value = storedSession as ChallengeSession
    }
  }

  const setSession = async (value: ChallengeSession | null) => {
    session.value = value
    if (value) {
      await saveToIndexedDB(SESSION_STORE_NAME, "current", value)
    } else {
      await removeFromIndexedDB(SESSION_STORE_NAME, "current")
    }
  }

  const clearSession = () => setSession(null)

  const startAcceptedChallenge = (value: ChallengeSession) => {
    setSession(value)
    playerStore.setUser({
      username: playerStore.playerName,
      avatar: playerStore.avatarIndex,
    })
    playerStore.gameMode = value.mode
    gameStore.prepareGame(value.revealTime, value.rounds)
  }

  const createChallenge = async () => {
    if (!["classic", "inspect", "gravity"].includes(playerStore.gameMode)) {
      throw new Error("This game mode cannot be challenged")
    }

    const response = await fetch("/api/friend-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: playerStore.playerId,
        mode: playerStore.gameMode,
        revealTime: Number(configStore.revealTime),
        rounds: gameStore.rounds,
        score: playerStore.points,
        username: playerStore.playerName,
        avatarIndex: playerStore.avatarIndex,
        avatarSpriteSheet: playerStore.avatarSpriteSheet,
        answerHistory: playerStore.answerHistory,
      }),
    })

    if (!response.ok) throw new Error("Could not create challenge")
    const data = await response.json()
    const sessionId = String(data.sessionId)

    const now = Date.now()
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
    const challengeLink = `${window.location.origin}/challenge?sessionId=${sessionId}`

    const storedChallenge: StoredChallenge = {
      sessionId,
      link: challengeLink,
      score: playerStore.points,
      mode: playerStore.gameMode as "classic" | "inspect" | "gravity",
      createdAt: now,
      expiresAt: now + sevenDaysInMs,
      hasOpponent: false,
    }

    try {
      const db = await openDatabase()
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      store.put(storedChallenge)
    } catch (error) {
      console.error("Could not save challenge to IndexedDB", error)
    }

    return sessionId
  }

  const submitOpponentResult = async () => {
    if (!session.value) return
    const res = await fetch(
      `/api/friend-challenge?sessionId=${encodeURIComponent(session.value.sessionId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: playerStore.playerId,
          score: playerStore.points,
          username: playerStore.playerName,
          avatarIndex: playerStore.avatarIndex,
          avatarSpriteSheet: playerStore.avatarSpriteSheet,
          answerHistory: playerStore.answerHistory,
        }),
        keepalive: true,
      },
    )

    if (res.ok) {
      await setSession((await res.json()) as ChallengeSession)
    }
  }

  const updateChallengeStatus = async (sessionId: string, hasOpponent: boolean) => {
    try {
      const db = await openDatabase()
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)

      const request = store.get(sessionId)
      request.onsuccess = () => {
        const record = request.result as StoredChallenge
        if (record && record.hasOpponent !== hasOpponent) {
          record.hasOpponent = hasOpponent
          store.put(record)
        }
      }
    } catch (error) {
      console.error("Could not update challenge status in IndexedDB", error)
    }
  }

  loadStored()

  return {
    session,
    active,
    setSession,
    clearSession,
    startAcceptedChallenge,
    createChallenge,
    submitOpponentResult,
    updateChallengeStatus,
  }
})