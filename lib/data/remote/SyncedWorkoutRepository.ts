import type { WorkoutRepository } from "../repositories";
import type { Workout, WorkoutExercise, WorkoutSet } from "../types";
import {
  fetchWorkouts,
  saveWorkout,
  updateWorkoutNote,
  type RemoteWorkout,
} from "./workoutApi";

/**
 * The active (in-progress) session lives in the wrapped local repository so
 * logging works instantly and offline. When the user finishes a workout the
 * whole session is pushed to the backend, and the History tab reads finished
 * workouts back from it.
 */
export class SyncedWorkoutRepository implements WorkoutRepository {
  private remoteWorkouts = new Map<string, Workout>();
  private remoteExercises = new Map<string, WorkoutExercise[]>();
  private remoteSets = new Map<string, WorkoutSet[]>();
  private hasLoadedRemote = false;

  constructor(private readonly local: WorkoutRepository) {}

  private cacheRemote(workouts: RemoteWorkout[]): void {
    this.remoteWorkouts.clear();
    this.remoteExercises.clear();
    this.remoteSets.clear();
    for (const remote of workouts) {
      this.remoteWorkouts.set(remote.id, {
        id: remote.id,
        date: remote.startedAt,
        finishedAt: remote.finishedAt,
        note: remote.note,
      });
      this.remoteExercises.set(
        remote.id,
        remote.exercises.map((exercise) => ({
          id: exercise.id,
          workoutId: remote.id,
          exerciseId: exercise.exerciseId,
          order: exercise.position,
        })),
      );
      for (const exercise of remote.exercises) {
        this.remoteSets.set(
          exercise.id,
          exercise.sets.map((set) => ({
            id: set.id,
            workoutExerciseId: exercise.id,
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            completed: set.completed,
          })),
        );
      }
    }
    this.hasLoadedRemote = true;
  }

  async getHistory(): Promise<Workout[]> {
    try {
      this.cacheRemote(await fetchWorkouts());
    } catch (error) {
      console.warn("Failed to load workout history:", error);
      // Fall through to whatever was cached (possibly nothing).
    }
    return [...this.remoteWorkouts.values()].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }

  async getById(id: string): Promise<Workout | null> {
    // The summary screen can be opened before the history list has loaded
    // (e.g. deep link), so lazily fetch on a cache miss.
    if (!this.remoteWorkouts.has(id) && !this.hasLoadedRemote) {
      await this.getHistory();
    }
    return this.remoteWorkouts.get(id) ?? this.local.getById(id);
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    return (
      this.remoteExercises.get(workoutId) ??
      this.local.getWorkoutExercises(workoutId)
    );
  }

  async getSets(workoutExerciseId: string): Promise<WorkoutSet[]> {
    return (
      this.remoteSets.get(workoutExerciseId) ??
      this.local.getSets(workoutExerciseId)
    );
  }

  async finishWorkout(workoutId: string): Promise<Workout> {
    // Snapshot the session before finishing so the payload is complete.
    const workoutExercises = await this.local.getWorkoutExercises(workoutId);
    const exercises = await Promise.all(
      workoutExercises.map(async (workoutExercise) => ({
        exerciseId: workoutExercise.exerciseId,
        position: workoutExercise.order,
        sets: (await this.local.getSets(workoutExercise.id)).map((set) => ({
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
        })),
      })),
    );

    const finished = await this.local.finishWorkout(workoutId);

    try {
      await saveWorkout({
        startedAt: finished.date,
        finishedAt: finished.finishedAt ?? new Date().toISOString(),
        note: finished.note,
        exercises,
      });
    } catch (error) {
      // The local finish stands either way; the session just won't appear
      // in history until a future sync mechanism retries.
      console.warn("Failed to sync finished workout:", error);
    }
    return finished;
  }

  // The rest is the live, unfinished session — purely local.

  getActiveWorkout(): Promise<Workout | null> {
    return this.local.getActiveWorkout();
  }

  getWorkoutByDate(dateKey: string): Promise<Workout | null> {
    return this.local.getWorkoutByDate(dateKey);
  }

  startWorkout(): Promise<Workout> {
    return this.local.startWorkout();
  }

  async updateWorkoutNote(workoutId: string, note: string): Promise<Workout> {
    // Synced (finished) workouts live in the backend, not the local store.
    const remote = this.remoteWorkouts.get(workoutId);
    if (remote) {
      await updateWorkoutNote(workoutId, note);
      const updated = { ...remote, note };
      this.remoteWorkouts.set(workoutId, updated);
      return updated;
    }
    return this.local.updateWorkoutNote(workoutId, note);
  }

  addExerciseToWorkout(
    workoutId: string,
    exerciseId: string,
  ): Promise<WorkoutExercise> {
    return this.local.addExerciseToWorkout(workoutId, exerciseId);
  }

  removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
    return this.local.removeExerciseFromWorkout(workoutExerciseId);
  }

  addSet(
    workoutExerciseId: string,
    input: { weight: number; reps: number },
  ): Promise<WorkoutSet> {
    return this.local.addSet(workoutExerciseId, input);
  }

  updateSet(
    setId: string,
    patch: Partial<Pick<WorkoutSet, "weight" | "reps" | "completed">>,
  ): Promise<WorkoutSet> {
    return this.local.updateSet(setId, patch);
  }

  deleteSet(setId: string): Promise<void> {
    return this.local.deleteSet(setId);
  }
}
