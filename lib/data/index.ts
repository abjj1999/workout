import {
  MockExerciseRepository,
  MockWorkoutRepository,
} from "./mock/MockRepository";
import { SyncedWorkoutRepository } from "./remote/SyncedWorkoutRepository";
import type { ExerciseRepository, WorkoutRepository } from "./repositories";

export type { ExerciseRepository, WorkoutRepository } from "./repositories";
export type {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "./types";

// Exercises are bundled locally; workouts keep the live session local and
// sync finished ones to the workout-api backend (Supabase).
export const exerciseRepository: ExerciseRepository =
  new MockExerciseRepository();
export const workoutRepository: WorkoutRepository =
  new SyncedWorkoutRepository(new MockWorkoutRepository());
