import { apiFetch } from "./apiClient";

// Body-weight endpoints of the workout-api backend.

export interface BodyWeightEntry {
  id: string;
  /** Pounds. */
  weight: number;
  loggedAt: string;
}

export async function fetchBodyWeights(): Promise<BodyWeightEntry[]> {
  const body = (await apiFetch("/api/body-weight")) as {
    data: BodyWeightEntry[];
  };
  return body.data;
}

export async function logBodyWeight(weight: number): Promise<void> {
  await apiFetch("/api/body-weight", {
    method: "POST",
    body: JSON.stringify({ weight }),
  });
}
