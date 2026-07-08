import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Chip } from "@/components/ui";
import { colors } from "@/constants/colors";
import { exerciseRepository, type Exercise } from "@/lib/data";

// Muted looping autoplay: gym-friendly defaults. Native controls stay on so
// the user can unmute, scrub, or go fullscreen.
function ExerciseVideoPlayer({ url }: { url: string }) {
  const player = useVideoPlayer(url, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width: "100%", aspectRatio: 16 / 9 }}
      contentFit="contain"
      allowsFullscreen
    />
  );
}

export default function ExerciseVideoScreen() {
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
          <View className="mt-4 gap-4">
            <View className="overflow-hidden rounded-card border border-border bg-surface">
              <ExerciseVideoPlayer url={exercise.videoUrl} />
            </View>
            <View className="flex-row flex-wrap gap-2">
              {exercise.muscleGroups.map((group) => (
                <Chip key={group} label={group} />
              ))}
            </View>
            {exercise.subRegions.length > 0 ? (
              <Text className="font-body text-body text-text-secondary">
                Targets: {exercise.subRegions.join(", ")}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text className="mt-16 text-center font-body text-body text-text-secondary">
            {loading ? "Loading…" : "Exercise not found."}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
