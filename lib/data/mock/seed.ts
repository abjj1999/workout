import type { Workout, WorkoutExercise, WorkoutSet } from "../types";

export interface MockData {
  workouts: Workout[];
  workoutExercises: WorkoutExercise[];
  sets: WorkoutSet[];
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}_${++idCounter}`;

function daysAgoAt9am(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9, 0, 0, 0);
  return d;
}

type SetPlan = { weight: number; reps: number; completed: boolean };
type ExercisePlan = { exerciseId: string; sets: SetPlan[] };

const sets = (
  weight: number,
  reps: number,
  count: number,
  completedCount: number,
): SetPlan[] =>
  Array.from({ length: count }, (_, i) => ({
    weight,
    reps,
    completed: i < completedCount,
  }));

const done = (weight: number, reps: number, count = 3): SetPlan[] =>
  sets(weight, reps, count, count);

function buildWorkout(
  data: MockData,
  daysAgo: number,
  finished: boolean,
  plans: ExercisePlan[],
): void {
  const started = daysAgoAt9am(daysAgo);
  const workout: Workout = {
    id: nextId("workout"),
    date: started.toISOString(),
    finishedAt: finished
      ? new Date(started.getTime() + 65 * 60 * 1000).toISOString()
      : null,
  };
  data.workouts.push(workout);

  plans.forEach((plan, order) => {
    const workoutExercise: WorkoutExercise = {
      id: nextId("we"),
      workoutId: workout.id,
      exerciseId: plan.exerciseId,
      order,
    };
    data.workoutExercises.push(workoutExercise);

    plan.sets.forEach((set, i) => {
      data.sets.push({
        id: nextId("set"),
        workoutExerciseId: workoutExercise.id,
        setNumber: i + 1,
        weight: set.weight,
        reps: set.reps,
        completed: set.completed,
      });
    });
  });
}

const pushDay = (): ExercisePlan[] => [
  { exerciseId: "bench-press", sets: done(185, 8, 4) },
  { exerciseId: "incline-db-press", sets: done(65, 10) },
  { exerciseId: "overhead-press", sets: done(105, 8) },
  { exerciseId: "lateral-raise", sets: done(20, 15) },
  { exerciseId: "triceps-pushdown", sets: done(50, 12) },
];

const pullDay = (): ExercisePlan[] => [
  { exerciseId: "pull-up", sets: done(0, 10, 4) },
  { exerciseId: "barbell-row", sets: done(155, 10) },
  { exerciseId: "lat-pulldown", sets: done(120, 12) },
  { exerciseId: "barbell-curl", sets: done(70, 10) },
  { exerciseId: "hammer-curl", sets: done(30, 12) },
];

const legDay = (): ExercisePlan[] => [
  { exerciseId: "back-squat", sets: done(225, 6, 4) },
  { exerciseId: "romanian-deadlift", sets: done(185, 10) },
  { exerciseId: "leg-press", sets: done(360, 12) },
  { exerciseId: "leg-curl", sets: done(90, 12) },
  { exerciseId: "calf-raise", sets: done(140, 15) },
];

/**
 * Seeds a partially completed push workout dated today, plus three weeks
 * of finished push/pull/legs history.
 */
export function createSeedData(): MockData {
  const data: MockData = { workouts: [], workoutExercises: [], sets: [] };

  // Today's push workout, mid-session: earlier sets done, later ones pending.
  buildWorkout(data, 0, false, [
    { exerciseId: "bench-press", sets: sets(185, 8, 4, 3) },
    { exerciseId: "incline-db-press", sets: sets(65, 10, 3, 1) },
    { exerciseId: "overhead-press", sets: sets(105, 8, 3, 0) },
    { exerciseId: "triceps-pushdown", sets: sets(50, 12, 3, 0) },
  ]);

  // Three weeks of history: push / pull / legs, three sessions per week.
  const rotation = [pushDay, pullDay, legDay];
  const daysAgo = [2, 4, 6, 9, 11, 13, 16, 18, 20];
  daysAgo.forEach((days, i) => {
    buildWorkout(data, days, true, rotation[i % rotation.length]());
  });

  return data;
}
