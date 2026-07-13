import type { Workout, WorkoutExercise, WorkoutSet } from "../types";

export interface MockData {
  workouts: Workout[];
  workoutExercises: WorkoutExercise[];
  sets: WorkoutSet[];
}

/**
 * The local store only holds the live (unfinished) session now; finished
 * workouts are synced to the backend and read back from there, so there is
 * no fake history to seed.
 */
export function createSeedData(): MockData {
  return { workouts: [], workoutExercises: [], sets: [] };
}
