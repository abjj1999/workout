import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { Button, Card, Screen, Skeleton, SkeletonPulse } from "@/components/ui";
import { colors } from "@/constants/colors";
import { exerciseRepository, type Exercise } from "@/lib/data";
import { deleteRoutine, type Routine } from "@/lib/data/remote/routinesApi";
import { useRoutines } from "@/lib/hooks/useRoutines";
import { addExercisesToToday } from "@/lib/startSession";

export default function RoutinesScreen() {
  const router = useRouter();
  const { routines, loading, reload } = useRoutines();
  const [exercisesById, setExercisesById] = useState<Map<string, Exercise>>(
    () => new Map(),
  );
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const all = await exerciseRepository.getAll();
      setExercisesById(new Map(all.map((exercise) => [exercise.id, exercise])));
    })();
  }, []);

  const describe = useMemo(
    () =>
      (routine: Routine): string => {
        const names = routine.exerciseIds
          .map((id) => exercisesById.get(id)?.name)
          .filter((name): name is string => Boolean(name));
        const shown = names.slice(0, 3).join(" · ");
        const extra = names.length - 3;
        return extra > 0 ? `${shown} +${extra} more` : shown;
      },
    [exercisesById],
  );

  // Adds the routine's exercises to today's session and jumps to Today.
  const handleStart = async (routine: Routine) => {
    if (startingId) return;
    setStartingId(routine.id);
    try {
      await addExercisesToToday(routine.exerciseIds);
      router.navigate("/");
    } finally {
      setStartingId(null);
    }
  };

  const handleDelete = (routine: Routine) => {
    Alert.alert("Delete routine?", `"${routine.name}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRoutine(routine.id);
          } catch (error) {
            console.warn("Failed to delete routine:", error);
          }
          await reload();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Text className="font-display text-title uppercase text-text-primary">
        Routines
      </Text>

      {loading ? (
        <SkeletonPulse>
          <View className="mt-4 gap-4">
            {[0, 1, 2].map((placeholder) => (
              <Card key={placeholder} className="gap-3">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-12" />
              </Card>
            ))}
          </View>
        </SkeletonPulse>
      ) : routines.length === 0 ? (
        <View className="mt-16 items-center gap-6">
          <Text className="text-center font-body text-body text-text-secondary">
            No routines yet. Save your usual workout once and start it with
            one tap.
          </Text>
          <Button
            label="Create Routine"
            onPress={() => router.push("/create-routine")}
            className="self-stretch"
          />
        </View>
      ) : (
        <View className="mt-4 gap-4">
          {routines.map((routine) => (
            <Card key={routine.id} className="gap-3">
              <View className="flex-row items-center gap-2">
                <Text
                  numberOfLines={1}
                  className="flex-1 font-display text-body uppercase text-text-primary"
                >
                  {routine.name}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${routine.name}`}
                  onPress={() => handleDelete(routine)}
                  hitSlop={8}
                  className="h-8 w-8 items-center justify-center"
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
              <Text
                numberOfLines={2}
                className="font-body text-label text-text-secondary"
              >
                {routine.exerciseIds.length}{" "}
                {routine.exerciseIds.length === 1 ? "exercise" : "exercises"}
                {describe(routine) ? ` — ${describe(routine)}` : ""}
              </Text>
              <Button
                label="Start"
                loading={startingId === routine.id}
                disabled={startingId !== null && startingId !== routine.id}
                onPress={() => handleStart(routine)}
              />
            </Card>
          ))}
          <Button
            variant="ghost"
            label="+ Create Routine"
            onPress={() => router.push("/create-routine")}
          />
        </View>
      )}
    </Screen>
  );
}
