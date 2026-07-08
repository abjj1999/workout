import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import {
  exerciseRepository,
  workoutRepository,
  type Workout,
} from "@/lib/data";

export interface WorkoutSummary {
  workout: Workout;
  /** Primary muscle group of each exercise, deduplicated, in workout order. */
  muscleGroups: string[];
  exerciseCount: number;
  completedSets: number;
  /** Total weight moved: sum of weight × reps over completed sets. */
  totalVolume: number;
  durationMinutes: number | null;
}

// Loads all finished workouts and rolls each up into the numbers the
// History tab shows. Everything flows through the repository interfaces.
export function useWorkoutHistory() {
  const [summaries, setSummaries] = useState<WorkoutSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestRef.current;
    const workouts = await workoutRepository.getHistory();
    const loaded = await Promise.all(
      workouts.map(async (workout): Promise<WorkoutSummary> => {
        const workoutExercises = await workoutRepository.getWorkoutExercises(
          workout.id,
        );
        const muscleGroups: string[] = [];
        let completedSets = 0;
        let totalVolume = 0;
        for (const workoutExercise of workoutExercises) {
          const exercise = await exerciseRepository.getById(
            workoutExercise.exerciseId,
          );
          const muscle = exercise?.muscleGroups[0];
          if (muscle && !muscleGroups.includes(muscle)) {
            muscleGroups.push(muscle);
          }
          const sets = await workoutRepository.getSets(workoutExercise.id);
          for (const set of sets) {
            if (set.completed) {
              completedSets += 1;
              totalVolume += set.weight * set.reps;
            }
          }
        }
        const durationMinutes = workout.finishedAt
          ? Math.max(
              0,
              Math.round(
                (new Date(workout.finishedAt).getTime() -
                  new Date(workout.date).getTime()) /
                  60000,
              ),
            )
          : null;
        return {
          workout,
          muscleGroups,
          exerciseCount: workoutExercises.length,
          completedSets,
          totalVolume,
          durationMinutes,
        };
      }),
    );
    if (requestId !== requestRef.current) return;
    setSummaries(loaded);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { summaries, loading, reload };
}
