import {
  MockExerciseRepository,
  MockWorkoutRepository,
} from "./mock/MockRepository";
import type { ExerciseRepository, WorkoutRepository } from "./repositories";

export type { ExerciseRepository, WorkoutRepository } from "./repositories";
export type {
  Exercise,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "./types";

// Swap these for real implementations (e.g. Supabase) later; screens only
// ever see the interface types.
export const exerciseRepository: ExerciseRepository =
  new MockExerciseRepository();
export const workoutRepository: WorkoutRepository =
  new MockWorkoutRepository();
