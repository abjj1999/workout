import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import {
  fetchBodyWeights,
  logBodyWeight,
  type BodyWeightEntry,
} from "@/lib/data/remote/bodyWeightApi";

// Recent weigh-ins (newest first) plus a log() that saves and refreshes.
export function useBodyWeight() {
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestRef.current;
    let loaded: BodyWeightEntry[] = [];
    try {
      loaded = await fetchBodyWeights();
    } catch (error) {
      console.warn("Failed to load body weight:", error);
      return;
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
    if (requestId !== requestRef.current) return;
    setEntries(loaded);
  }, []);

  const log = useCallback(
    async (weight: number) => {
      await logBodyWeight(weight);
      await reload();
    },
    [reload],
  );

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { entries, loading, log };
}
