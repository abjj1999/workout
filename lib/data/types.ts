export interface Exercise {
  id: string;
  name: string;
  /** Body parts, e.g. "chest" — the picker's filter chips. */
  muscleGroups: string[];
  /** Primary + secondary muscles, e.g. "pectorals". */
  subRegions: string[];
  equipment: string;
  thumbnailUrl: string;
  /** Animated demonstration (GIF, ~180p). */
  gifUrl: string;
  /** Step-by-step how-to instructions. */
  instructions: string[];
}

export interface Workout {
  id: string;
  /** ISO date-time the workout was started. */
  date: string;
  /** ISO date-time the workout was finished, or null while in progress. */
  finishedAt: string | null;
  /** Free-form note the user attaches to the session. */
  note: string | null;
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  order: number;
}

export interface WorkoutSet {
  id: string;
  workoutExerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}
