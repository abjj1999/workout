// Weights are STORED in lbs everywhere (repos, Supabase, payloads); the
// unit setting only changes what the user sees and types. Convert with
// these helpers exactly at the display/input boundary.

export type WeightUnit = "lbs" | "kg";

const LBS_PER_KG = 2.20462262;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Stored lbs → number to show for the active unit. */
export function toDisplayWeight(lbs: number, unit: WeightUnit): number {
  return unit === "lbs" ? lbs : round1(lbs / LBS_PER_KG);
}

/** User-typed number in the active unit → lbs to store. */
export function toStoredWeight(value: number, unit: WeightUnit): number {
  return unit === "lbs" ? value : round1(value * LBS_PER_KG);
}

/** Stepper increment in display units: 5 lbs or 2.5 kg. */
export function weightStep(unit: WeightUnit): number {
  return unit === "lbs" ? 5 : 2.5;
}
