import { DEFAULT_SET_VALUES, DEFAULT_SETS_PER_EXERCISE } from "@/constants/workout";
import { workoutRepository } from "@/lib/data";
import { toDateKey } from "@/lib/dates";

/**
 * Adds exercises to today's session, starting one if none is live, each
 * with the default starter sets. Exercises already in the session are
 * skipped, so starting a routine twice doesn't double it up. Used by the
 * exercise picker's Done and the Routines tab's Start.
 */
export async function addExercisesToToday(
  exerciseIds: Iterable<string>,
): Promise<void> {
  const existing = await workoutRepository.getWorkoutByDate(
    toDateKey(new Date()),
  );
  const workout =
    existing && existing.finishedAt === null
      ? existing
      : await workoutRepository.startWorkout();

  const current = await workoutRepository.getWorkoutExercises(workout.id);
  const currentIds = new Set(current.map((we) => we.exerciseId));

  for (const exerciseId of exerciseIds) {
    if (currentIds.has(exerciseId)) continue;
    const workoutExercise = await workoutRepository.addExerciseToWorkout(
      workout.id,
      exerciseId,
    );
    for (let i = 0; i < DEFAULT_SETS_PER_EXERCISE; i++) {
      await workoutRepository.addSet(workoutExercise.id, DEFAULT_SET_VALUES);
    }
  }
}
