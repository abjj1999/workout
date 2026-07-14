import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { exerciseRepository, workoutRepository } from "@/lib/data";

export interface LifetimeStats {
  workouts: number;
  completedSets: number;
  /** Total weight moved across all completed sets, in lbs. */
  totalVolume: number;
  /** ISO date of the first synced workout, or null with no history. */
  firstWorkoutDate: string | null;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
}

const TOP_RECORDS = 5;

// Walks the synced history once and rolls it up into lifetime totals and
// the heaviest completed set per exercise (top five by weight).
export function useProfileStats() {
  const [stats, setStats] = useState<LifetimeStats | null>(null);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestRef.current;

    const workouts = await workoutRepository.getHistory();
    let completedSets = 0;
    let totalVolume = 0;
    const bestByExercise = new Map<string, { weight: number; reps: number }>();

    for (const workout of workouts) {
      const workoutExercises = await workoutRepository.getWorkoutExercises(
        workout.id,
      );
      for (const workoutExercise of workoutExercises) {
        const sets = await workoutRepository.getSets(workoutExercise.id);
        for (const set of sets) {
          if (!set.completed) continue;
          completedSets += 1;
          totalVolume += set.weight * set.reps;
          const best = bestByExercise.get(workoutExercise.exerciseId);
          if (
            !best ||
            set.weight > best.weight ||
            (set.weight === best.weight && set.reps > best.reps)
          ) {
            bestByExercise.set(workoutExercise.exerciseId, {
              weight: set.weight,
              reps: set.reps,
            });
          }
        }
      }
    }

    const top = [...bestByExercise.entries()]
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, TOP_RECORDS);
    const loadedRecords = await Promise.all(
      top.map(async ([exerciseId, best]): Promise<PersonalRecord> => {
        const exercise = await exerciseRepository.getById(exerciseId);
        return {
          exerciseId,
          exerciseName: exercise?.name ?? "Unknown exercise",
          weight: best.weight,
          reps: best.reps,
        };
      }),
    );

    if (requestId !== requestRef.current) return;
    setStats({
      workouts: workouts.length,
      completedSets,
      totalVolume,
      // getHistory returns newest first.
      firstWorkoutDate: workouts[workouts.length - 1]?.date ?? null,
    });
    setRecords(loadedRecords);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { stats, records, loading };
}
