import type { Exercise, Workout, WorkoutExercise, WorkoutSet } from "./types";

// Screens depend on these interfaces only. The mock implementation can be
// swapped for Supabase-backed repositories without touching UI code.

export interface ExerciseRepository {
  getAll(): Promise<Exercise[]>;
  getById(id: string): Promise<Exercise | null>;
  getByMuscleGroup(muscleGroup: string): Promise<Exercise[]>;
  search(query: string): Promise<Exercise[]>;
}

export interface WorkoutRepository {
  /** The unfinished workout, if one is in progress. */
  getActiveWorkout(): Promise<Workout | null>;
  /**
   * The workout that started on the given local calendar day
   * (key format "YYYY-MM-DD"). Prefers an in-progress workout if the day
   * somehow has more than one.
   */
  getWorkoutByDate(dateKey: string): Promise<Workout | null>;
  /** Finished workouts, newest first. */
  getHistory(): Promise<Workout[]>;
  getById(id: string): Promise<Workout | null>;
  getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]>;
  getSets(workoutExerciseId: string): Promise<WorkoutSet[]>;

  startWorkout(): Promise<Workout>;
  finishWorkout(workoutId: string): Promise<Workout>;
  updateWorkoutNote(workoutId: string, note: string): Promise<Workout>;
  addExerciseToWorkout(
    workoutId: string,
    exerciseId: string,
  ): Promise<WorkoutExercise>;
  removeExerciseFromWorkout(workoutExerciseId: string): Promise<void>;
  addSet(
    workoutExerciseId: string,
    input: { weight: number; reps: number },
  ): Promise<WorkoutSet>;
  updateSet(
    setId: string,
    patch: Partial<Pick<WorkoutSet, "weight" | "reps" | "completed">>,
  ): Promise<WorkoutSet>;
  deleteSet(setId: string): Promise<void>;
}
