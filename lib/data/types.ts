export interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  subRegions: string[];
  thumbnailUrl: string;
  videoUrl: string;
}

export interface Workout {
  id: string;
  /** ISO date-time the workout was started. */
  date: string;
  /** ISO date-time the workout was finished, or null while in progress. */
  finishedAt: string | null;
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
