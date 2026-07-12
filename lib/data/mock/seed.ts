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
    note: null,
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

// Exercise ids reference the bundled exercises-dataset library.
const pushDay = (): ExercisePlan[] => [
  { exerciseId: "0025", sets: done(185, 8, 4) }, // Barbell Bench Press
  { exerciseId: "0314", sets: done(65, 10) }, // Dumbbell Incline Bench Press
  { exerciseId: "0091", sets: done(105, 8) }, // Barbell Seated Overhead Press
  { exerciseId: "0334", sets: done(20, 15) }, // Dumbbell Lateral Raise
  { exerciseId: "0201", sets: done(50, 12) }, // Cable Pushdown
];

const pullDay = (): ExercisePlan[] => [
  { exerciseId: "0652", sets: done(0, 10, 4) }, // Pull-Up
  { exerciseId: "0027", sets: done(155, 10) }, // Barbell Bent Over Row
  { exerciseId: "0198", sets: done(120, 12) }, // Cable Pulldown
  { exerciseId: "0031", sets: done(70, 10) }, // Barbell Curl
  { exerciseId: "0313", sets: done(30, 12) }, // Dumbbell Hammer Curl
];

const legDay = (): ExercisePlan[] => [
  { exerciseId: "0043", sets: done(225, 6, 4) }, // Barbell Full Squat
  { exerciseId: "0085", sets: done(185, 10) }, // Barbell Romanian Deadlift
  { exerciseId: "0739", sets: done(360, 12) }, // Sled 45° Leg Press
  { exerciseId: "0586", sets: done(90, 12) }, // Lever Lying Leg Curl
  { exerciseId: "0605", sets: done(140, 15) }, // Lever Standing Calf Raise
];

/**
 * Seeds three weeks of finished push/pull/legs history. Today is left
 * empty on purpose: the user starts a fresh session from the Today tab.
 */
export function createSeedData(): MockData {
  const data: MockData = { workouts: [], workoutExercises: [], sets: [] };

  // Dense recent history — one finished workout on each of the last seven
  // days so the History tab's current week has something on every day —
  // plus older sessions so paging back a week (or two) shows content too.
  const rotation = [pushDay, pullDay, legDay];
  const daysAgo = [1, 2, 3, 4, 5, 6, 7, 9, 11, 13, 16, 18, 20];
  daysAgo.forEach((days, i) => {
    buildWorkout(data, days, true, rotation[i % rotation.length]());
  });

  return data;
}
