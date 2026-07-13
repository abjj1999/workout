import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Chip, Input, ListRow } from "@/components/ui";
import { colors } from "@/constants/colors";
import {
  DEFAULT_SET_VALUES,
  DEFAULT_SETS_PER_EXERCISE,
} from "@/constants/workout";
import {
  exerciseRepository,
  workoutRepository,
  type Exercise,
} from "@/lib/data";
import { toDateKey } from "@/lib/dates";

// Multi-select exercise picker. Reached from Today's "Start New Session"
// (no workout yet — Done starts one) and from "+ Add Exercise" (appends to
// the active workout). Every selected exercise starts with default sets so
// there is something to edit immediately.
export default function AddExerciseScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [existingIds, setExistingIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setExercises(await exerciseRepository.getAll());
      const workout = await workoutRepository.getWorkoutByDate(
        toDateKey(new Date()),
      );
      if (workout && workout.finishedAt === null) {
        const workoutExercises = await workoutRepository.getWorkoutExercises(
          workout.id,
        );
        setExistingIds(new Set(workoutExercises.map((we) => we.exerciseId)));
      }
    })();
  }, []);

  // Filter chips are the primary target muscles (subRegions[0], e.g.
  // "biceps"), most common first. Secondary muscles are too inconsistent
  // in the dataset to filter on.
  const muscleGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const exercise of exercises) {
      const target = exercise.subRegions[0];
      if (target) counts.set(target, (counts.get(target) ?? 0) + 1);
    }
    return [...counts.keys()].sort(
      (a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0),
    );
  }, [exercises]);

  // Muscle filter is a union: pick lats + biceps and you get every exercise
  // that targets either. Search narrows further within that.
  const visibleExercises = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return exercises.filter((exercise) => {
      if (
        selectedMuscles.size > 0 &&
        !selectedMuscles.has(exercise.subRegions[0])
      ) {
        return false;
      }
      return !needle || exercise.name.toLowerCase().includes(needle);
    });
  }, [exercises, query, selectedMuscles]);

  const toggleMuscle = (group: string) => {
    setSelectedMuscles((current) => {
      const next = new Set(current);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDone = async () => {
    if (selectedIds.size === 0 || saving) return;
    setSaving(true);
    const existing = await workoutRepository.getWorkoutByDate(
      toDateKey(new Date()),
    );
    const workout =
      existing && existing.finishedAt === null
        ? existing
        : await workoutRepository.startWorkout();
    for (const exerciseId of selectedIds) {
      const workoutExercise = await workoutRepository.addExerciseToWorkout(
        workout.id,
        exerciseId,
      );
      for (let i = 0; i < DEFAULT_SETS_PER_EXERCISE; i++) {
        await workoutRepository.addSet(workoutExercise.id, DEFAULT_SET_VALUES);
      }
    }
    // Today reloads on focus, so it picks the new session up immediately.
    router.back();
  };

  const doneLabel =
    selectedIds.size === 0
      ? "Select Exercises"
      : `Add ${selectedIds.size} ${
          selectedIds.size === 1 ? "Exercise" : "Exercises"
        }`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 font-display text-title uppercase text-text-primary">
            Add Exercises
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.back()}
            className="h-12 w-12 items-center justify-center"
            style={({ pressed }) =>
              pressed ? { transform: [{ scale: 0.98 }] } : undefined
            }
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Input
          placeholder="Search exercises"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          className="mt-4"
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 max-h-8 flex-none"
          contentContainerClassName="gap-2 pr-4"
        >
          {muscleGroups.map((group) => (
            <Chip
              key={group}
              label={group}
              selected={selectedMuscles.has(group)}
              onPress={() => toggleMuscle(group)}
            />
          ))}
        </ScrollView>

        <FlatList
          data={visibleExercises}
          keyExtractor={(exercise) => exercise.id}
          className="mt-2 flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text className="mt-8 text-center font-body text-body text-text-secondary">
              No exercises match
            </Text>
          }
          renderItem={({ item }) => {
            const added = existingIds.has(item.id);
            const selected = selectedIds.has(item.id);
            return (
              <ListRow
                title={item.name}
                subtitle={item.subRegions.join(" · ")}
                className={added ? "opacity-40" : ""}
                leading={
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                    contentFit="cover"
                  />
                }
                trailing={
                  added ? (
                    <Text className="font-body-medium text-label uppercase text-text-secondary">
                      Added
                    </Text>
                  ) : (
                    <View
                      className={`h-7 w-7 items-center justify-center rounded-full border ${
                        selected ? "border-accent bg-accent" : "border-border"
                      }`}
                    >
                      {selected ? (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={colors.textPrimary}
                        />
                      ) : null}
                    </View>
                  )
                }
                onPress={added ? undefined : () => toggleSelected(item.id)}
              />
            );
          }}
        />

        <Button
          label={doneLabel}
          disabled={selectedIds.size === 0 || saving}
          onPress={handleDone}
          className="mb-4 mt-3"
        />
      </View>
    </SafeAreaView>
  );
}
