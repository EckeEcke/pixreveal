import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import allDrawings from "../data/drawings.json";
import type { Drawing } from "@/types/game";
import drawings from "@/data/drawings.json";
import { toast } from "vue3-toastify";
import { useSoundStore } from "./sound";

export const CATEGORIES = [
  {
    name: "Animals & Nature",
    color: "var(--neon-success)",
    icon: "🌿",
  },
  { name: "Objects & People", color: "var(--neon-blue)", icon: "📦" },
  { name: "Food", color: "var(--primary)", icon: "🍕" },
  { name: "Gaming", color: "var(--neon-pink)", icon: "🎮" },
  { name: "Anime & Cartoons", color: "var(--neon-yellow)", icon: "📺" },
  {
    name: "Movies & TV",
    color: "var(--neon-purple)",
    icon: "🎬",
  },
];

export const PRESETS = {
  GENERAL: ["Animals & Nature", "Objects & People", "Food"],
  NERDY: ["Gaming", "Anime & Cartoons", "Movies & TV"],
  ALL: CATEGORIES.map((c) => c.name),
} as const;

export type PresetType = "general" | "nerdy" | "all";

export const allCategoryNames = CATEGORIES.map((c) => c.name);

export const minimumCategories = 4;

export const useConfigStore = defineStore("config", () => {
  const revealTime = ref(10);
  const selectedCategories = ref([...allCategoryNames]);
  const minimumDrawings = computed(() => maxRounds.value * 4);
  const includeUgc = ref(false);
  const ugcDrawings: Ref<Drawing[]> = ref([]);
  const isManualOpen = ref(false);
  const isSettingsOpen = ref(false);

  const showKeyHints = ref(false);

  const toggleKeyHints = () => {
    showKeyHints.value = !showKeyHints.value;
  };

  const fetchUgcDrawings = async () => {
    fetch(
      "https://raw.githubusercontent.com/EckeEcke/pixreveal-ugc/main/approved.json",
    )
      .then((res) => res.json())
      .then((data) => {
        ugcDrawings.value = data;
      })
      .catch((err) => console.error("UGC fetch fehlgeschlagen:", err));
  };

  const filteredDrawings: Ref<Drawing[]> = computed(() => {
    const base = includeUgc.value
      ? drawings.concat(ugcDrawings.value)
      : drawings;

    return base.filter((drawing) =>
      selectedCategories.value.includes(drawing.category),
    );
  });

  const isCategorySelected = computed(() => {
    return (category: string) => selectedCategories.value.includes(category);
  });

  const hasActiveFilters = computed(() => {
    return selectedCategories.value.length < allCategoryNames.length;
  });

  const activePreset = computed<PresetType | "custom">(() => {
    const current = selectedCategories.value;
    const isSame = (arr: readonly string[]) =>
      arr.length === current.length && arr.every((c) => current.includes(c));

    if (isSame(PRESETS.GENERAL)) return "general";
    if (isSame(PRESETS.NERDY)) return "nerdy";
    if (isSame(PRESETS.ALL)) return "all";
    return "custom";
  });

  const setPreset = (preset: PresetType) => {
    if (preset === "general") {
      selectedCategories.value = [...PRESETS.GENERAL];
    } else if (preset === "nerdy") {
      selectedCategories.value = [...PRESETS.NERDY];
    } else if (preset === "all") {
      selectedCategories.value = [...PRESETS.ALL];
    }
  };

  const toggleCategory = (category: string) => {
    const index = selectedCategories.value.indexOf(category);
    if (index > -1) {
      const tempPoolSize = allDrawings.filter((d) =>
        selectedCategories.value
          .filter((c) => c !== category)
          .includes(d.category),
      ).length;

      if (
        tempPoolSize >= minimumDrawings.value &&
        selectedCategories.value.length > 1
      ) {
        selectedCategories.value.splice(index, 1);
      } else {
        toast.error(`NOT ENOUGH DRAWINGS! Need ${maxRounds.value * 4} items.`, {
          icon: "🚫",
          style: {
            fontFamily: "8bit",
          },
        });
        useSoundStore().playSound("incorrect");
      }
    } else {
      selectedCategories.value.push(category);
    }
  };

  const resetToDefault = () => {
    selectedCategories.value = [...allCategoryNames];
  };

  const _maxRounds = ref(10);
  const maxRounds = computed({
    get: () => _maxRounds.value,
    set: (newValue: number) => {
      if (filteredDrawings.value.length >= newValue * 4) {
        _maxRounds.value = newValue;
      } else {
        console.log("Nicht genug Bilder im Pool!");
      }
    },
  });

  const categoriesWithCounts = computed(() => {
    return CATEGORIES.map((category) => {
      const count = drawings.filter((d) => d.category === category.name).length;
      return {
        ...category,
        count,
      };
    });
  });

  const showManual = computed(() => isManualOpen.value);

  const openManual = () => {
    isManualOpen.value = true;
  };
  const closeManual = () => {
    isManualOpen.value = false;
  };

  return {
    categoriesWithCounts,
    revealTime,
    includeUgc,
    ugcDrawings,
    selectedCategories,
    isCategorySelected,
    hasActiveFilters,
    activePreset,
    setPreset,
    maxRounds,
    filteredDrawings,
    toggleCategory,
    resetToDefault,
    showManual,
    openManual,
    closeManual,
    showKeyHints,
    toggleKeyHints,
    fetchUgcDrawings,
  };
});