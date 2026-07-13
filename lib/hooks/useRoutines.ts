import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { fetchRoutines, type Routine } from "@/lib/data/remote/routinesApi";

// Loads the user's routines, refreshing whenever the screen gains focus
// (e.g. after creating one), like the other data hooks.
export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestRef.current;
    let loaded: Routine[] = [];
    try {
      loaded = await fetchRoutines();
    } catch (error) {
      console.warn("Failed to load routines:", error);
      return;
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
    if (requestId !== requestRef.current) return;
    setRoutines(loaded);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { routines, loading, reload };
}
