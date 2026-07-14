import { apiFetch } from "./apiClient";

// Routine endpoints of the workout-api backend. Routines are templates —
// a named, ordered list of exercise ids sessions can be started from.

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
}

export async function fetchRoutines(): Promise<Routine[]> {
  const body = (await apiFetch("/api/routines")) as { data: Routine[] };
  return body.data;
}

export async function createRoutine(
  name: string,
  exerciseIds: string[],
): Promise<string> {
  const body = (await apiFetch("/api/routines", {
    method: "POST",
    body: JSON.stringify({ name, exerciseIds }),
  })) as { data: { id: string } };
  return body.data.id;
}

export async function deleteRoutine(routineId: string): Promise<void> {
  await apiFetch(`/api/routines/${routineId}`, { method: "DELETE" });
}
