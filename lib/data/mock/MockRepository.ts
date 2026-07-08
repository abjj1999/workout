import { toDateKey } from "../../dates";
import type { ExerciseRepository, WorkoutRepository } from "../repositories";
import type { Exercise, Workout, WorkoutExercise, WorkoutSet } from "../types";
import exercisesJson from "./exercises.json";
import { mockStore } from "./store";

const exercises: Exercise[] = exercisesJson;

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}_live_${++idCounter}`;

export class MockExerciseRepository implements ExerciseRepository {
  async getAll(): Promise<Exercise[]> {
    return exercises;
  }

  async getById(id: string): Promise<Exercise | null> {
    return exercises.find((exercise) => exercise.id === id) ?? null;
  }

  async getByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    const needle = muscleGroup.toLowerCase();
    return exercises.filter((exercise) =>
      exercise.muscleGroups.some((group) => group.toLowerCase() === needle),
    );
  }

  async search(query: string): Promise<Exercise[]> {
    const needle = query.trim().toLowerCase();
    if (!needle) return exercises;
    return exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(needle),
    );
  }
}

export class MockWorkoutRepository implements WorkoutRepository {
  async getActiveWorkout(): Promise<Workout | null> {
    return (
      mockStore.getState().workouts.find((w) => w.finishedAt === null) ?? null
    );
  }

  async getWorkoutByDate(dateKey: string): Promise<Workout | null> {
    const matches = mockStore
      .getState()
      .workouts.filter((w) => toDateKey(new Date(w.date)) === dateKey);
    return (
      matches.find((w) => w.finishedAt === null) ??
      matches[matches.length - 1] ??
      null
    );
  }

  async getHistory(): Promise<Workout[]> {
    return mockStore
      .getState()
      .workouts.filter((w) => w.finishedAt !== null)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async getById(id: string): Promise<Workout | null> {
    return mockStore.getState().workouts.find((w) => w.id === id) ?? null;
  }

  async getWorkoutExercises(workoutId: string): Promise<WorkoutExercise[]> {
    return mockStore
      .getState()
      .workoutExercises.filter((we) => we.workoutId === workoutId)
      .sort((a, b) => a.order - b.order);
  }

  async getSets(workoutExerciseId: string): Promise<WorkoutSet[]> {
    return mockStore
      .getState()
      .sets.filter((set) => set.workoutExerciseId === workoutExerciseId)
      .sort((a, b) => a.setNumber - b.setNumber);
  }

  async startWorkout(): Promise<Workout> {
    const workout: Workout = {
      id: nextId("workout"),
      date: new Date().toISOString(),
      finishedAt: null,
      note: null,
    };
    mockStore.setState((state) => ({
      workouts: [...state.workouts, workout],
    }));
    return workout;
  }

  async finishWorkout(workoutId: string): Promise<Workout> {
    const finishedAt = new Date().toISOString();
    mockStore.setState((state) => ({
      workouts: state.workouts.map((w) =>
        w.id === workoutId ? { ...w, finishedAt } : w,
      ),
    }));
    const workout = await this.getById(workoutId);
    if (!workout) throw new Error(`Workout not found: ${workoutId}`);
    return workout;
  }

  async updateWorkoutNote(workoutId: string, note: string): Promise<Workout> {
    mockStore.setState((state) => ({
      workouts: state.workouts.map((w) =>
        w.id === workoutId ? { ...w, note } : w,
      ),
    }));
    const workout = await this.getById(workoutId);
    if (!workout) throw new Error(`Workout not found: ${workoutId}`);
    return workout;
  }

  async addExerciseToWorkout(
    workoutId: string,
    exerciseId: string,
  ): Promise<WorkoutExercise> {
    const existing = await this.getWorkoutExercises(workoutId);
    const workoutExercise: WorkoutExercise = {
      id: nextId("we"),
      workoutId,
      exerciseId,
      order: existing.length,
    };
    mockStore.setState((state) => ({
      workoutExercises: [...state.workoutExercises, workoutExercise],
    }));
    return workoutExercise;
  }

  async removeExerciseFromWorkout(workoutExerciseId: string): Promise<void> {
    mockStore.setState((state) => ({
      workoutExercises: state.workoutExercises.filter(
        (we) => we.id !== workoutExerciseId,
      ),
      sets: state.sets.filter(
        (set) => set.workoutExerciseId !== workoutExerciseId,
      ),
    }));
  }

  async addSet(
    workoutExerciseId: string,
    input: { weight: number; reps: number },
  ): Promise<WorkoutSet> {
    const existing = await this.getSets(workoutExerciseId);
    const set: WorkoutSet = {
      id: nextId("set"),
      workoutExerciseId,
      setNumber: existing.length + 1,
      weight: input.weight,
      reps: input.reps,
      completed: false,
    };
    mockStore.setState((state) => ({ sets: [...state.sets, set] }));
    return set;
  }

  async updateSet(
    setId: string,
    patch: Partial<Pick<WorkoutSet, "weight" | "reps" | "completed">>,
  ): Promise<WorkoutSet> {
    mockStore.setState((state) => ({
      sets: state.sets.map((set) =>
        set.id === setId ? { ...set, ...patch } : set,
      ),
    }));
    const set = mockStore.getState().sets.find((s) => s.id === setId);
    if (!set) throw new Error(`Set not found: ${setId}`);
    return set;
  }

  async deleteSet(setId: string): Promise<void> {
    mockStore.setState((state) => {
      const target = state.sets.find((set) => set.id === setId);
      if (!target) return {};
      // Renumber the remaining sets of the same exercise so set numbers
      // stay sequential after a deletion.
      let nextNumber = 0;
      return {
        sets: state.sets
          .filter((set) => set.id !== setId)
          .map((set) =>
            set.workoutExerciseId === target.workoutExerciseId
              ? { ...set, setNumber: ++nextNumber }
              : set,
          ),
      };
    });
  }
}
