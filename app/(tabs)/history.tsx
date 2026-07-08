import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { WorkoutHistoryCard } from "@/components/history/WorkoutHistoryCard";
import { Screen } from "@/components/ui";
import { colors } from "@/constants/colors";
import { addDays, formatDayRange, toDateKey } from "@/lib/dates";
import { useWorkoutHistory } from "@/lib/hooks/useWorkoutHistory";

export default function HistoryScreen() {
  const router = useRouter();
  // 0 = the week ending today; each step back shifts the window 7 days.
  const [weekOffset, setWeekOffset] = useState(0);
  const [today] = useState(() => new Date());
  const { summaries, loading } = useWorkoutHistory();

  const weekEnd = addDays(today, -7 * weekOffset);
  const weekStart = addDays(weekEnd, -6);
  const startKey = toDateKey(weekStart);
  const endKey = toDateKey(weekEnd);

  // "YYYY-MM-DD" keys compare correctly as strings.
  const weekSummaries = summaries.filter((summary) => {
    const key = toDateKey(new Date(summary.workout.date));
    return key >= startKey && key <= endKey;
  });

  const atCurrentWeek = weekOffset === 0;

  return (
    <Screen>
      <Text className="font-display text-title uppercase text-text-primary">
        History
      </Text>

      <View className="mt-4 flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous week"
          onPress={() => setWeekOffset((offset) => offset + 1)}
          className="h-12 w-12 items-center justify-center"
          style={({ pressed }) =>
            pressed ? { transform: [{ scale: 0.98 }] } : undefined
          }
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.textPrimary}
          />
        </Pressable>
        <View className="flex-1 items-center gap-1">
          <Text className="font-display text-body text-text-primary">
            {formatDayRange(weekStart, weekEnd)}
          </Text>
          {atCurrentWeek ? (
            <Text className="font-body-medium text-label uppercase text-text-secondary">
              This Week
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next week"
          accessibilityState={{ disabled: atCurrentWeek }}
          disabled={atCurrentWeek}
          onPress={() => setWeekOffset((offset) => Math.max(0, offset - 1))}
          className={`h-12 w-12 items-center justify-center ${
            atCurrentWeek ? "opacity-40" : ""
          }`}
          style={({ pressed }) =>
            pressed ? { transform: [{ scale: 0.98 }] } : undefined
          }
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={colors.textPrimary}
          />
        </Pressable>
      </View>

      {!loading && weekSummaries.length === 0 ? (
        <Text className="mt-16 text-center font-body text-body text-text-secondary">
          No workouts this week
        </Text>
      ) : (
        <View className="mt-4 gap-4">
          {weekSummaries.map((summary) => (
            <WorkoutHistoryCard
              key={summary.workout.id}
              summary={summary}
              onPress={() =>
                router.push({
                  pathname: "/summary/[id]",
                  params: { id: summary.workout.id },
                })
              }
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
