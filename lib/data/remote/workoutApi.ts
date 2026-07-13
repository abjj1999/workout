import { apiFetch } from "./apiClient";

// Workout endpoints of the workout-api backend (Next.js + Supabase).

export interface RemoteSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

export interface RemoteExercise {
  id: string;
  exerciseId: string;
  position: number;
  sets: RemoteSet[];
}

export interface RemoteWorkout {
  id: string;
  startedAt: string;
  finishedAt: string;
  note: string | null;
  exercises: RemoteExercise[];
}

export interface WorkoutPayload {
  startedAt: string;
  finishedAt: string;
  note: string | null;
  exercises: {
    exerciseId: string;
    position: number;
    sets: Omit<RemoteSet, "id">[];
  }[];
}

export async function fetchWorkouts(): Promise<RemoteWorkout[]> {
  const body = (await apiFetch("/api/workouts")) as { data: RemoteWorkout[] };
  return body.data;
}

/** Saves a new workout and returns its backend id. */
export async function saveWorkout(payload: WorkoutPayload): Promise<string> {
  const body = (await apiFetch("/api/workouts", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { data: { id: string } };
  return body.data.id;
}

/** Replaces an already-synced workout (after an edit + re-finish). */
export async function replaceWorkout(
  workoutId: string,
  payload: WorkoutPayload,
): Promise<void> {
  await apiFetch(`/api/workouts/${workoutId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateWorkoutNote(
  workoutId: string,
  note: string,
): Promise<void> {
  await apiFetch(`/api/workouts/${workoutId}`, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}
