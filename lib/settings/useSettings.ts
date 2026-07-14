import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import type { WeightUnit } from "@/lib/units";

const WEIGHT_UNIT_KEY = "settings_weight_unit_v1";

// Per-device preferences. Weights stay stored in lbs regardless of the
// display unit (see lib/units).
interface SettingsState {
  /** True once persisted settings have been read from storage. */
  hydrated: boolean;
  weightUnit: WeightUnit;
  hydrate: () => Promise<void>;
  setWeightUnit: (unit: WeightUnit) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  hydrated: false,
  weightUnit: "lbs",
  hydrate: async () => {
    try {
      const unit = await AsyncStorage.getItem(WEIGHT_UNIT_KEY);
      set({
        weightUnit: unit === "kg" ? "kg" : "lbs",
        hydrated: true,
      });
    } catch {
      // Storage failure: fall back to defaults rather than blocking boot.
      set({ hydrated: true });
    }
  },
  setWeightUnit: (unit) => {
    set({ weightUnit: unit });
    AsyncStorage.setItem(WEIGHT_UNIT_KEY, unit).catch(() => {});
  },
}));
