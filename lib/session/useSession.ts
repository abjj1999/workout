import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const ONBOARDING_KEY = "onboarding_complete_v1";

// Onboarding-only session state. Authentication state lives in Clerk
// (see lib/auth/useAuth).
interface SessionState {
  /** True once the persisted onboarding flag has been read from storage. */
  hydrated: boolean;
  /** Persisted: the user has finished (or skipped) onboarding at least once. */
  hasOnboarded: boolean;
  hydrate: () => Promise<void>;
  completeOnboarding: () => void;
  /** Testing helper: clears the flag so the next launch shows onboarding. */
  resetOnboarding: () => Promise<void>;
}

export const useSession = create<SessionState>((set) => ({
  hydrated: false,
  hasOnboarded: false,
  hydrate: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      set({ hasOnboarded: value === "true", hydrated: true });
    } catch {
      // Treat a storage failure as a first launch rather than blocking boot.
      set({ hydrated: true });
    }
  },
  completeOnboarding: () => {
    // Flip state synchronously so routing reacts immediately; persist in the
    // background so a failed write never blocks the transition to auth.
    set({ hasOnboarded: true });
    AsyncStorage.setItem(ONBOARDING_KEY, "true").catch(() => {});
  },
  resetOnboarding: async () => {
    set({ hasOnboarded: false });
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch {
      // ignore
    }
  },
}));
