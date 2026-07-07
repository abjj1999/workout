import { createStore } from "zustand/vanilla";

import { createSeedData, type MockData } from "./seed";

// Vanilla Zustand store so the repositories stay framework-agnostic.
// Screens never touch this directly; they go through the repository
// interfaces exported from lib/data.
export const mockStore = createStore<MockData>(() => createSeedData());
