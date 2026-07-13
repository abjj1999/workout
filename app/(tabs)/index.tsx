import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from "react-native";

import { ExerciseCard } from "@/components/today/ExerciseCard";
import { Button, Card, Screen, Skeleton, SkeletonPulse } from "@/components/ui";
import { DEFAULT_SET_VALUES } from "@/constants/workout";
import { workoutRepository, type WorkoutSet } from "@/lib/data";
import { formatDayHeading, toDateKey } from "@/lib/dates";
import {
  useWorkoutForDate,
  type WorkoutSection,
} from "@/lib/hooks/useWorkoutForDate";

export default function TodayScreen() {
  const router = useRouter();
  // Captured once on mount; the Today tab always shows the current day.
  const [today] = useState(() => new Date());
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const dateKey = toDateKey(today);
  const { workout, sections, loading, reload } = useWorkoutForDate(dateKey);

  const editable = workout !== null && workout.finishedAt === null;

  // Primary muscle group of each exercise in today's session, deduplicated,
  // for the "You're working …" line under the date.
  const todayMuscles = sections.reduce<string[]>((groups, section) => {
    const muscle = section.exercise?.muscleGroups[0];
    if (muscle && !groups.includes(muscle)) groups.push(muscle);
    return groups;
  }, []);

  const handleFinishWorkout = async () => {
    if (!workout || finishing) return;
    setFinishing(true);
    try {
      // Finishing also syncs the session to the backend, so it can take a
      // moment on a slow connection.
      await workoutRepository.finishWorkout(workout.id);
      await reload();
      router.push({
        pathname: "/summary/[id]",
        params: { id: workout.id },
      });
    } finally {
      setFinishing(false);
    }
  };

  // Reopens a completed workout for edits; finishing again replaces the
  // synced session, so History shows the corrected version.
  const handleEditWorkout = async () => {
    if (!workout) return;
    await workoutRepository.reopenWorkout(workout.id);
    await reload();
  };

  const handleConfirmEdit = async (
    setId: string,
    values: { weight: number; reps: number },
  ) => {
    await workoutRepository.updateSet(setId, values);
    setEditingSetId(null);
    await reload();
  };

  const handleToggleCompleted = async (set: WorkoutSet) => {
    await workoutRepository.updateSet(set.id, { completed: !set.completed });
    await reload();
  };

  const handleDeleteSet = async (set: WorkoutSet) => {
    await workoutRepository.deleteSet(set.id);
    await reload();
  };

  const handleAddSet = async (section: WorkoutSection) => {
    setOpenMenuId(null);
    const lastSet = section.sets[section.sets.length - 1];
    await workoutRepository.addSet(
      section.workoutExercise.id,
      lastSet
        ? { weight: lastSet.weight, reps: lastSet.reps }
        : DEFAULT_SET_VALUES,
    );
    await reload();
  };

  const handleRemoveExercise = (section: WorkoutSection) => {
    setOpenMenuId(null);
    const name = section.exercise?.name ?? "this exercise";
    Alert.alert(
      "Remove exercise?",
      `${name} and its sets will be removed from this workout.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await workoutRepository.removeExerciseFromWorkout(
              section.workoutExercise.id,
            );
            await reload();
          },
        },
      ],
    );
  };

  const handleWatchVideo = (section: WorkoutSection) => {
    setOpenMenuId(null);
    router.push({
      pathname: "/video/[exerciseId]",
      params: { exerciseId: section.workoutExercise.exerciseId },
    });
  };

  return (
    <Screen>
      <Text className="font-display text-title uppercase text-text-primary">
        {formatDayHeading(today)}
      </Text>
      {todayMuscles.length > 0 ? (
        <Text className="mt-1 font-body-medium text-label uppercase text-text-secondary">
          You&apos;re working{" "}
          <Text className="text-accent">{todayMuscles.join(" · ")}</Text>
        </Text>
      ) : null}

      {loading ? (
        <SkeletonPulse>
          <View className="mt-4 gap-4">
            {[0, 1].map((placeholder) => (
              <Card key={placeholder} className="gap-3">
                <View className="flex-row items-center gap-3">
                  <Skeleton className="h-5 flex-1" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </View>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </Card>
            ))}
          </View>
        </SkeletonPulse>
      ) : workout === null ? (
        <View className="mt-16 items-center gap-6">
          <Text className="font-body text-body text-text-secondary">
            No workout logged
          </Text>
          <Button
            label="Start New Session"
            onPress={() => router.push("/add-exercise")}
            className="self-stretch"
          />
        </View>
      ) : (
        <View className="mt-4 gap-4">
          {workout?.finishedAt ? (
            <Text className="font-body-medium text-label uppercase text-text-secondary">
              Completed workout
            </Text>
          ) : null}
          {sections.map((section) => (
            <ExerciseCard
              key={section.workoutExercise.id}
              section={section}
              editable={editable}
              editingSetId={editingSetId}
              menuOpen={openMenuId === section.workoutExercise.id}
              onToggleMenu={() =>
                setOpenMenuId((current) =>
                  current === section.workoutExercise.id
                    ? null
                    : section.workoutExercise.id,
                )
              }
              onAddSet={() => handleAddSet(section)}
              onRemoveExercise={() => handleRemoveExercise(section)}
              onRequestEdit={setEditingSetId}
              onConfirmEdit={handleConfirmEdit}
              onCancelEdit={() => setEditingSetId(null)}
              onToggleCompleted={handleToggleCompleted}
              onDeleteSet={handleDeleteSet}
              watchVideo={() => handleWatchVideo(section)}
            />
          ))}
          {editable ? (
            <View className="mt-2 gap-3">
              <Button
                variant="ghost"
                label="+ Add Exercise"
                onPress={() => router.push("/add-exercise")}
              />
              {sections.length > 0 ? (
                <Button
                  label={finishing ? "Finishing…" : "Finish Workout"}
                  loading={finishing}
                  onPress={handleFinishWorkout}
                />
              ) : null}
            </View>
          ) : workout ? (
            <Button
              variant="ghost"
              label="Edit Workout"
              onPress={handleEditWorkout}
              className="mt-2"
            />
          ) : null}
        </View>
      )}
    </Screen>
  );
}
