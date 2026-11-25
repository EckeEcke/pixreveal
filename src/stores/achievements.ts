import { computed, h, ref } from "vue";
import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import { ACHIEVEMENTS, type AchievementId } from "@/data/achievements";
import { BONUS_AVATAR_ACHIEVEMENT_THRESHOLD, NAME_EFFECTS, AVATAR_EFFECTS } from "@/data/unlockables";
import { useSoundStore } from "@/stores/sound";

const DATABASE_NAME = "pixreveal-achievements";
const DATABASE_VERSION = 1;
const STORE_NAME = "unlocked";
const achievementIds = new Set(ACHIEVEMENTS.map((achievement) => achievement.id));

type AchievementUnlock = {
  id: AchievementId;
  unlockedAt: number;
};

let databasePromise: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (databasePromise) return databasePromise;

  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error: unknown) => {
    databasePromise = null;
    throw error;
  });

  databasePromise = opening;
  return opening;
};

const requestResult = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const transactionResult = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });

export const useAchievementsStore = defineStore("achievements", () => {
  const soundStore = useSoundStore();
  const unlockedAtById = ref<Partial<Record<AchievementId, number>>>({});
  const retiredUnlockCount = ref(0);
  const isLoaded = ref(false);
  const unlockedCount = computed(() => Object.keys(unlockedAtById.value).length);
  // Keep previously earned cosmetic rewards when achievements are retired.
  const cosmeticProgress = computed(() => unlockedCount.value + retiredUnlockCount.value);
  const hasBonusAvatars = computed(
    () => cosmeticProgress.value >= BONUS_AVATAR_ACHIEVEMENT_THRESHOLD,
  );
  const hasNameEffects = computed(
    () => cosmeticProgress.value >= (NAME_EFFECTS[0]?.unlockAt ?? Number.POSITIVE_INFINITY),
  );
  const hasAvatarEffects = computed(
    () => cosmeticProgress.value >= (AVATAR_EFFECTS[0]?.unlockAt ?? Number.POSITIVE_INFINITY),
  );
  let loadPromise: Promise<void> | null = null;
  const unlocking = new Set<AchievementId>();

  const loadAchievements = (): Promise<void> => {
    if (isLoaded.value) return Promise.resolve();
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      let shouldUnlockCompletionist = false;
      try {
        const database = await openDatabase();
        const transaction = database.transaction(STORE_NAME, "readonly");
        const completion = transactionResult(transaction);
        const records = await requestResult(
          transaction.objectStore(STORE_NAME).getAll() as IDBRequest<AchievementUnlock[]>,
        );
        await completion;
        const activeRecords = records.filter((record) => achievementIds.has(record.id));
        retiredUnlockCount.value = records.length - activeRecords.length;
        unlockedAtById.value = Object.fromEntries(
          activeRecords.map((record) => [record.id, record.unlockedAt]),
        );
        shouldUnlockCompletionist = ACHIEVEMENTS
          .filter((achievement) => achievement.id !== "completionist")
          .every((achievement) => unlockedAtById.value[achievement.id] !== undefined);
      } catch (error) {
        console.error("Failed to load achievements", error);
      } finally {
        isLoaded.value = true;
        loadPromise = null;
      }
      if (shouldUnlockCompletionist) void unlock("completionist");
    })();

    return loadPromise;
  };

  const unlock = async (id: AchievementId): Promise<boolean> => {
    if (!ACHIEVEMENTS.some((achievement) => achievement.id === id)) return false;
    await loadAchievements();
    if (unlockedAtById.value[id] || unlocking.has(id)) return false;

    unlocking.add(id);
    const record: AchievementUnlock = { id, unlockedAt: Date.now() };

    try {
      const database = await openDatabase();
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const completion = transactionResult(transaction);
      transaction.objectStore(STORE_NAME).put(record);
      await completion;
      unlockedAtById.value = { ...unlockedAtById.value, [id]: record.unlockedAt };
      soundStore.playSound("reward");
      const achievement = ACHIEVEMENTS.find((item) => item.id === id);
      if (achievement) {
        toast.success(
          h("div", { class: "achievement-unlock-toast" }, [
            h(
              "span",
              { class: "achievement-unlock-toast__icon", "aria-hidden": "true" },
              achievement.icon,
            ),
            h("div", { class: "achievement-unlock-toast__copy" }, [
              h("span", { class: "achievement-unlock-toast__eyebrow" }, "ACHIEVEMENT UNLOCKED"),
              h("strong", { class: "achievement-unlock-toast__title" }, achievement.title),
              h("p", { class: "achievement-unlock-toast__description" }, achievement.description),
            ]),
          ]),
          { icon: false, autoClose: 3000 },
        );
      }
      if (id !== "completionist" && unlockedCount.value >= ACHIEVEMENTS.length - 1) {
        void unlock("completionist");
      }
      return true;
    } catch (error) {
      console.error("Failed to save achievement", error);
      return false;
    } finally {
      unlocking.delete(id);
    }
  };

  const isUnlocked = (id: AchievementId) => unlockedAtById.value[id] !== undefined;

  return {
    unlockedAtById,
    unlockedCount,
    cosmeticProgress,
    hasBonusAvatars,
    hasNameEffects,
    hasAvatarEffects,
    isLoaded,
    loadAchievements,
    isUnlocked,
    unlock,
  };
});
