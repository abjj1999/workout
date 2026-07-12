import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Chip } from "@/components/ui";
import { colors } from "@/constants/colors";
import { exerciseRepository, type Exercise } from "@/lib/data";

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setExercise(await exerciseRepository.getById(exerciseId));
      setLoading(false);
    })();
  }, [exerciseId]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center gap-2">
          <Text
            numberOfLines={2}
            className="flex-1 font-display text-title uppercase text-text-primary"
          >
            {exercise?.name ?? "Exercise"}
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

        {exercise ? (
          <ScrollView
            className="mt-4 flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4 pb-6"
          >
            <View className="items-center overflow-hidden rounded-card border border-border bg-surface p-4">
              {/* Source GIFs are square 180p; cap the size so they stay crisp. */}
              <Image
                source={{ uri: exercise.gifUrl }}
                style={{ width: 240, height: 240, borderRadius: 12 }}
                contentFit="contain"
                cachePolicy="disk"
              />
            </View>
            <View className="flex-row flex-wrap gap-2">
              {exercise.muscleGroups.map((group) => (
                <Chip key={group} label={group} />
              ))}
              <Chip label={exercise.equipment} />
            </View>
            {exercise.subRegions.length > 0 ? (
              <Text className="font-body text-body text-text-secondary">
                Targets: {exercise.subRegions.join(", ")}
              </Text>
            ) : null}
            {exercise.instructions.length > 0 ? (
              <View className="gap-2">
                <Text className="font-body-semibold text-body text-text-primary">
                  How to
                </Text>
                {exercise.instructions.map((step, index) => (
                  <View key={index} className="flex-row gap-2">
                    <Text className="font-body-semibold text-body text-accent">
                      {index + 1}.
                    </Text>
                    <Text className="flex-1 font-body text-body text-text-secondary">
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            <Text className="font-body text-label text-text-secondary">
              Exercise media © Gym visual — gymvisual.com
            </Text>
          </ScrollView>
        ) : (
          <Text className="mt-16 text-center font-body text-body text-text-secondary">
            {loading ? "Loading…" : "Exercise not found."}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
