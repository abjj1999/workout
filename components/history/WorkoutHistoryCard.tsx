import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { Card, Chip } from "@/components/ui";
import { colors } from "@/constants/colors";
import { formatDayHeading } from "@/lib/dates";
import type { WorkoutSummary } from "@/lib/hooks/useWorkoutHistory";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight } from "@/lib/units";

// "12340" -> "12,340" without relying on Intl availability.
function formatNumber(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1">
      <Text className="font-display text-body text-text-primary">{value}</Text>
      <Text className="font-body text-label uppercase text-text-secondary">
        {label}
      </Text>
    </View>
  );
}

export function WorkoutHistoryCard({
  summary,
  onPress,
}: {
  summary: WorkoutSummary;
  onPress?: () => void;
}) {
  const {
    workout,
    muscleGroups,
    exerciseCount,
    completedSets,
    totalVolume,
    durationMinutes,
  } = summary;
  const unit = useSettings((state) => state.weightUnit);

  const card = (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between gap-2">
        <Text className="font-display text-body text-text-primary">
          {formatDayHeading(new Date(workout.date))}
        </Text>
        <View className="flex-row items-center gap-2">
          {durationMinutes !== null ? (
            <Text className="font-display text-label text-text-secondary">
              {durationMinutes} MIN
            </Text>
          ) : null}
          {onPress ? (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          ) : null}
        </View>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {muscleGroups.map((muscle) => (
          <Chip key={muscle} label={muscle} />
        ))}
      </View>

      <View className="h-px bg-border" />

      <View className="flex-row">
        <Stat
          value={String(exerciseCount)}
          label={exerciseCount === 1 ? "Exercise" : "Exercises"}
        />
        <Stat value={String(completedSets)} label="Sets" />
        <Stat
          value={formatNumber(Math.round(toDisplayWeight(totalVolume, unit)))}
          label="Volume"
        />
      </View>
    </Card>
  );

  if (!onPress) return card;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) =>
        pressed ? { transform: [{ scale: 0.98 }] } : undefined
      }
    >
      {card}
    </Pressable>
  );
}
