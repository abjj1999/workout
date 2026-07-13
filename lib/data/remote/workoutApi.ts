import { getClerkInstance } from "@clerk/expo";

// Thin client for the workout-api backend (Next.js + Supabase). Requests
// carry the current Clerk session token; the API verifies it and scopes
// every row to that user.

const BASE_URL = process.env.EXPO_PUBLIC_WORKOUT_API_URL;

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

async function apiFetch(path: string, init?: RequestInit): Promise<unknown> {
  if (!BASE_URL) {
    throw new Error(
      "Missing EXPO_PUBLIC_WORKOUT_API_URL. Add it to .env.local.",
    );
  }
  const token = await getClerkInstance().session?.getToken();
  if (!token) throw new Error("Not signed in");

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(`API ${path} failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchWorkouts(): Promise<RemoteWorkout[]> {
  const body = (await apiFetch("/api/workouts")) as { data: RemoteWorkout[] };
  return body.data;
}

export async function saveWorkout(payload: WorkoutPayload): Promise<void> {
  await apiFetch("/api/workouts", {
    method: "POST",
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
