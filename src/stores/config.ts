import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import allDrawings from "../data/drawings.json";
import type { Drawing } from "./game";
import drawings from "@/data/drawings.json";
import { toast } from "vue3-toastify";
import { useSoundStore } from "./sound";

export const CATEGORIES = [
  {
    name: "Animals & Nature",
    color: "#4ade80",
    icon: "🌿",
  },
  { name: "Anime & Cartoons", color: "#fbbf24", icon: "📺" },
  { name: "Food", color: "#fb7185", icon: "🍕" },
  { name: "Gaming", color: "#f472b6", icon: "🎮" },
  {
    name: "Movies & TV",
    color: "#a78bfa",
    icon: "🎬",
  },
  { name: "Objects & People", color: "#94a3b8", icon: "📦" },
  {
    name: "Superheroes",
    color: "#60a5fa",
    icon: "🛡️",
  },
];

export const allCategoryNames = CATEGORIES.map((c) => c.name);

export const minimumCategories = 4;

export const useConfigStore = defineStore("config", () => {
  const revealTime = ref(15);
  const selectedCategories = ref([...allCategoryNames]);
  const minimumDrawings = computed(() => maxRounds.value * 4);
  const includeUgc = ref(false);
  const addCRTFilter = ref(false);
  const ugcDrawings: Ref<Drawing[]> = ref([]);
  const isManualOpen = ref(false);
  const isSettingsOpen = ref(false);

  fetch(
    "https://raw.githubusercontent.com/EckeEcke/pixreveal-ugc/main/approved.json",
  )
    .then((res) => res.json())
    .then((data) => {
      ugcDrawings.value = data;
    })
    .catch((err) => console.error("UGC fetch fehlgeschlagen:", err));

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
  const showSettings = computed(() => isSettingsOpen.value);

  const openManual = () => {
    isManualOpen.value = true;
  };
  const closeManual = () => {
    isManualOpen.value = false;
  };

  const openSettings = () => {
    isSettingsOpen.value = true;
  };
  const closeSettings = () => {
    isSettingsOpen.value = false;
  };

  return {
    categoriesWithCounts,
    revealTime,
    includeUgc,
    addCRTFilter,
    ugcDrawings,
    selectedCategories,
    isCategorySelected,
    hasActiveFilters,
    maxRounds,
    filteredDrawings,
    toggleCategory,
    resetToDefault,
    showManual,
    showSettings,
    openManual,
    closeManual,
    openSettings,
    closeSettings,
  };
});
