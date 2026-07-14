import { Text, View } from "react-native";

import { Card, Skeleton, SkeletonPulse } from "@/components/ui";
import type { PersonalRecord } from "@/lib/hooks/useProfileStats";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight } from "@/lib/units";

// Heaviest completed set per exercise, top five by weight.
export function PersonalRecords({
  records,
  loading,
}: {
  records: PersonalRecord[];
  loading: boolean;
}) {
  const unit = useSettings((state) => state.weightUnit);
  if (loading) {
    return (
      <SkeletonPulse>
        <Card className="mt-4 gap-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
          <Skeleton className="h-6" />
        </Card>
      </SkeletonPulse>
    );
  }

  return (
    <Card className="mt-4 gap-3">
      <Text className="font-body-medium text-label uppercase text-text-secondary">
        Personal Records
      </Text>
      {records.length === 0 ? (
        <Text className="font-body text-body text-text-secondary">
          Finish a workout with completed sets to start setting records.
        </Text>
      ) : (
        records.map((record) => (
          <View
            key={record.exerciseId}
            className="flex-row items-center gap-2"
          >
            <Text
              numberOfLines={1}
              className="flex-1 font-body text-body text-text-primary"
            >
              {record.exerciseName}
            </Text>
            <Text className="font-display text-body text-accent">
              {toDisplayWeight(record.weight, unit)} × {record.reps}
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}
