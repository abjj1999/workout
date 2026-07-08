import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import {
  exerciseRepository,
  workoutRepository,
  type Exercise,
  type Workout,
  type WorkoutExercise,
  type WorkoutSet,
} from "@/lib/data";

export interface WorkoutSection {
  workoutExercise: WorkoutExercise;
  exercise: Exercise | null;
  sets: WorkoutSet[];
}

// Loads the workout for a calendar day through the repository interfaces and
// exposes reload() so the screen can re-fetch after each mutation.
export function useWorkoutForDate(dateKey: string) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sections, setSections] = useState<WorkoutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestRef.current;
    const loadedWorkout = await workoutRepository.getWorkoutByDate(dateKey);
    let loadedSections: WorkoutSection[] = [];
    if (loadedWorkout) {
      const workoutExercises = await workoutRepository.getWorkoutExercises(
        loadedWorkout.id,
      );
      loadedSections = await Promise.all(
        workoutExercises.map(async (workoutExercise) => ({
          workoutExercise,
          exercise: await exerciseRepository.getById(
            workoutExercise.exerciseId,
          ),
          sets: await workoutRepository.getSets(workoutExercise.id),
        })),
      );
    }
    // A newer request started while this one was in flight; drop it.
    if (requestId !== requestRef.current) return;
    setWorkout(loadedWorkout);
    setSections(loadedSections);
    setLoading(false);
  }, [dateKey]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { workout, sections, loading, reload };
}
