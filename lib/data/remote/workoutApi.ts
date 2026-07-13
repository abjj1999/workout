import { getClerkInstance, isClerkRuntimeError } from "@clerk/expo";

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

const REQUEST_TIMEOUT_MS = 10_000;

async function apiFetch(path: string, init?: RequestInit): Promise<unknown> {
  if (!BASE_URL) {
    throw new Error(
      "Missing EXPO_PUBLIC_WORKOUT_API_URL. Add it to .env.local.",
    );
  }

  let token: string | null | undefined;
  try {
    token = await getClerkInstance().session?.getToken();
  } catch (error) {
    if (isClerkRuntimeError(error) && error.code === "network_error") {
      throw new Error(`API ${path} skipped: offline (no session token)`);
    }
    throw error;
  }
  if (!token) throw new Error("Not signed in");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`API ${path} failed: ${response.status}`);
    }
    // Await inside the try so the timeout also covers reading the body.
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`API ${path} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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
