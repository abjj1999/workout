import { useCallback, useEffect, useRef, useState } from "react";

import {
  exerciseRepository,
  workoutRepository,
  type Workout,
} from "@/lib/data";

export interface ExerciseBreakdown {
  workoutExerciseId: string;
  name: string;
  muscle: string | null;
  completedSets: number;
  totalSets: number;
  /** Weight moved across completed sets: sum of weight × reps. */
  volume: number;
}

export interface WorkoutDetail {
  workout: Workout;
  muscleGroups: string[];
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  durationMinutes: number | null;
  breakdown: ExerciseBreakdown[];
}

// Loads one workout and rolls it up for the summary screen, all through the
// repository interfaces.
export function useWorkoutDetail(workoutId: string) {
  const [detail, setDetail] = useState<WorkoutDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++requestRef.current;
    const workout = await workoutRepository.getById(workoutId);
    if (!workout) {
      if (requestId === requestRef.current) {
        setDetail(null);
        setLoading(false);
      }
      return;
    }

    const workoutExercises = await workoutRepository.getWorkoutExercises(
      workout.id,
    );
    const muscleGroups: string[] = [];
    const breakdown: ExerciseBreakdown[] = [];
    let completedSets = 0;
    let totalSets = 0;
    let totalVolume = 0;

    for (const workoutExercise of workoutExercises) {
      const exercise = await exerciseRepository.getById(
        workoutExercise.exerciseId,
      );
      const muscle = exercise?.muscleGroups[0] ?? null;
      if (muscle && !muscleGroups.includes(muscle)) {
        muscleGroups.push(muscle);
      }
      const sets = await workoutRepository.getSets(workoutExercise.id);
      let exerciseCompleted = 0;
      let exerciseVolume = 0;
      for (const set of sets) {
        if (set.completed) {
          exerciseCompleted += 1;
          exerciseVolume += set.weight * set.reps;
        }
      }
      completedSets += exerciseCompleted;
      totalSets += sets.length;
      totalVolume += exerciseVolume;
      breakdown.push({
        workoutExerciseId: workoutExercise.id,
        name: exercise?.name ?? "Unknown exercise",
        muscle,
        completedSets: exerciseCompleted,
        totalSets: sets.length,
        volume: exerciseVolume,
      });
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

    if (requestId !== requestRef.current) return;
    setDetail({
      workout,
      muscleGroups,
      exerciseCount: workoutExercises.length,
      completedSets,
      totalSets,
      totalVolume,
      durationMinutes,
      breakdown,
    });
    setLoading(false);
  }, [workoutId]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { detail, loading, reload };
}
