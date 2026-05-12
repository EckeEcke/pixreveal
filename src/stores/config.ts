import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import allDrawings from "../data/drawings.json";
import type { Drawing } from "./game";
import drawings from "@/data/drawings.json";
import { toast } from "vue3-toastify";
import { useSoundStore } from "./sound";
import router from "@/router";
import type { LocationQueryRaw, LocationQueryValue } from "vue-router";

type QueryValue = LocationQueryValue | LocationQueryValue[] | undefined;

const isQueryEnabled = (value: QueryValue) => {
  if (Array.isArray(value)) {
    return value.some((v) => v !== null && v !== undefined && v !== "");
  }
  if (value === null || value === undefined) return false;
  if (value === "" || value === "1" || value === "true") return true;
  return true;
};

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
  const currentRoute = router.currentRoute;
  const revealTime = ref(15);
  const selectedCategories = ref([...allCategoryNames]);
  const minimumDrawings = computed(() => maxRounds.value * 4);
  const includeUgc = ref(false);
  const ugcDrawings: Ref<Drawing[]> = ref([]);

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

  const showManual = computed(() =>
    isQueryEnabled(currentRoute.value.query.manual),
  );
  const showSettings = computed(() =>
    isQueryEnabled(currentRoute.value.query.settings),
  );

  const patchQuery = (patch: Record<string, any>) => {
    const nextQuery: Record<string, any> = { ...currentRoute.value.query, ...patch };

    Object.keys(nextQuery).forEach((key) => {
      if (nextQuery[key] === undefined || nextQuery[key] === null) {
        delete nextQuery[key];
      }
    });

    router.replace({ query: nextQuery as unknown as LocationQueryRaw });
  };

  const openManual = () => patchQuery({ manual: "1" });
  const closeManual = () => patchQuery({ manual: undefined });

  const openSettings = () => patchQuery({ settings: "1" });
  const closeSettings = () => patchQuery({ settings: undefined });

  return {
    categoriesWithCounts,
    revealTime,
    includeUgc,
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
