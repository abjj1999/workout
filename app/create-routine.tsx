import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Chip, Input, ListRow } from "@/components/ui";
import { colors } from "@/constants/colors";
import { exerciseRepository, type Exercise } from "@/lib/data";
import { createRoutine } from "@/lib/data/remote/routinesApi";

// Name a routine and pick its exercises (same multi-select interaction as
// the session picker). Selection order becomes the routine's order.
export default function CreateRoutineScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setExercises(await exerciseRepository.getAll());
    })();
  }, []);

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
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selected) => selected !== id)
        : [...current, id],
    );
  };

  const canSave = name.trim().length > 0 && selectedIds.length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await createRoutine(name.trim(), selectedIds);
      // Routines reloads on focus, so the new one shows up immediately.
      router.back();
    } catch (saveError) {
      console.warn("Failed to create routine:", saveError);
      setError("Couldn't save the routine. Check your connection and retry.");
      setSaving(false);
    }
  };

  const saveLabel =
    selectedIds.length === 0
      ? "Select Exercises"
      : `Save Routine (${selectedIds.length})`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 font-display text-title uppercase text-text-primary">
            New Routine
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
          placeholder="Routine name (e.g. Push Day)"
          value={name}
          onChangeText={setName}
          className="mt-4"
        />

        <Input
          placeholder="Search exercises"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          className="mt-3"
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
            const selected = selectedIds.includes(item.id);
            return (
              <ListRow
                title={item.name}
                subtitle={item.subRegions.join(" · ")}
                leading={
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={{ width: 40, height: 40, borderRadius: 8 }}
                    contentFit="cover"
                  />
                }
                trailing={
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
                }
                onPress={() => toggleSelected(item.id)}
              />
            );
          }}
        />

        {error ? (
          <Text className="mt-2 text-center font-body text-label text-accent">
            {error}
          </Text>
        ) : null}
        <Button
          label={saveLabel}
          disabled={!canSave}
          loading={saving}
          onPress={handleSave}
          className="mb-4 mt-3"
        />
      </View>
    </SafeAreaView>
  );
}
