import { Text, View } from "react-native";

import { Card, Skeleton, SkeletonPulse } from "@/components/ui";
import { formatMonthYear } from "@/lib/dates";
import type { LifetimeStats as Stats } from "@/lib/hooks/useProfileStats";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight } from "@/lib/units";

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

// Lifetime totals across every synced workout.
export function LifetimeStats({
  stats,
  loading,
}: {
  stats: Stats | null;
  loading: boolean;
}) {
  const unit = useSettings((state) => state.weightUnit);
  if (loading || !stats) {
    return (
      <SkeletonPulse>
        <Card className="mt-4 gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12" />
        </Card>
      </SkeletonPulse>
    );
  }

  return (
    <Card className="mt-4 gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-medium text-label uppercase text-text-secondary">
          All Time
        </Text>
        {stats.firstWorkoutDate ? (
          <Text className="font-body text-label uppercase text-text-secondary">
            Since {formatMonthYear(new Date(stats.firstWorkoutDate))}
          </Text>
        ) : null}
      </View>
      <View className="flex-row">
        <Stat
          value={String(stats.workouts)}
          label={stats.workouts === 1 ? "Workout" : "Workouts"}
        />
        <Stat value={formatNumber(stats.completedSets)} label="Sets" />
        <Stat
          value={formatNumber(
            Math.round(toDisplayWeight(stats.totalVolume, unit)),
          )}
          label="Volume"
        />
      </View>
    </Card>
  );
}
