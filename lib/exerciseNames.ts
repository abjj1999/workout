// Friendly display names for the exercise dataset's anatomical jargon.
// Applied once when the exercise library loads (see MockRepository), so
// chips, subtitles, and detail screens all show the same names and the
// muscle filter merges synonyms (e.g. "quadriceps" and "quads").
// Extend either map freely — unknown values pass through unchanged.

const MUSCLE_RENAMES: Record<string, string> = {
  // synonyms → one canonical name
  quadriceps: "quads",
  abdominals: "abs",
  "lower abs": "abs",
  trapezius: "traps",
  "latissimus dorsi": "lats",
  delts: "shoulders",
  deltoids: "shoulders",
  "rear deltoids": "rear delts",
  rhomboids: "upper back",

  // hard anatomical terms → gym-friendly ones
  pectorals: "chest",
  "serratus anterior": "chest",
  brachialis: "biceps",
  "cardiovascular system": "cardio",
  spine: "lower back",
  soleus: "calves",
  sternocleidomastoid: "neck",
  "levator scapulae": "neck",
  adductors: "inner thighs",
  groin: "inner thighs",
  abductors: "outer thighs",
  "ankle stabilizers": "ankles",
  wrists: "forearms",
  "wrist flexors": "forearms",
  "wrist extensors": "forearms",
  "grip muscles": "forearms",
  hands: "forearms",
};

export function friendlyMuscleName(muscle: string): string {
  return MUSCLE_RENAMES[muscle.toLowerCase()] ?? muscle;
}

// Phrase cleanups for exercise names.
const EXERCISE_NAME_RENAMES: [RegExp, string][] = [
  [/\bLever\b/g, "Machine"], // "Lever Lying Leg Curl" → "Machine Lying Leg Curl"
  [/\bEz Barbell\b/g, "EZ Bar"],
  [/\bSz-Bar\b/gi, "EZ Bar"],
];

export function friendlyExerciseName(name: string): string {
  return EXERCISE_NAME_RENAMES.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    name,
  );
}
