import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, Chip, Input } from "@/components/ui";
import { colors } from "@/constants/colors";
import { workoutRepository } from "@/lib/data";
import { formatDayHeading } from "@/lib/dates";
import {
  useWorkoutDetail,
  type WorkoutDetail,
} from "@/lib/hooks/useWorkoutDetail";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight, type WeightUnit } from "@/lib/units";

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

// Simple rule-based coaching line derived from set completion.
function buildRecommendation(detail: WorkoutDetail, unit: WeightUnit): string {
  const { completedSets, totalSets, breakdown } = detail;
  if (totalSets === 0) {
    return "No sets logged in this session. Next time, log your sets as you go so your progress is tracked.";
  }
  const top = breakdown.reduce(
    (best, entry) => (entry.volume > best.volume ? entry : best),
    breakdown[0],
  );
  const rate = completedSets / totalSets;
  if (rate >= 1) {
    const bump = unit === "kg" ? "2.5 kg" : "5 lbs";
    return `You completed every set — strong session. Consider adding ${bump} to ${top.name} next time to keep progressing.`;
  }
  if (rate >= 0.75) {
    return `You finished ${completedSets} of ${totalSets} sets. Repeat these weights next session and aim to complete them all before moving up.`;
  }
  return `You completed ${completedSets} of ${totalSets} sets. Consider dropping the weight about 10% next time to rebuild momentum.`;
}

// Volume-per-exercise bars, longest bar = highest volume. Tapping an
// exercise expands its set-by-set detail.
function VolumeGraph({
  breakdown,
  unit,
}: {
  breakdown: WorkoutDetail["breakdown"];
  unit: WeightUnit;
}) {
  const maxVolume = Math.max(1, ...breakdown.map((entry) => entry.volume));
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <View className="gap-4">
      {breakdown.map((entry) => {
        const expanded = expandedIds.has(entry.workoutExerciseId);
        return (
          <View key={entry.workoutExerciseId} className="gap-1.5">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              accessibilityLabel={`${entry.name}, ${entry.completedSets} of ${entry.totalSets} sets`}
              onPress={() => toggleExpanded(entry.workoutExerciseId)}
              className="gap-1.5"
            >
              <View className="flex-row items-center justify-between gap-2">
                <Text
                  numberOfLines={1}
                  className="flex-1 font-body text-body text-text-primary"
                >
                  {entry.name}
                </Text>
                <Text className="font-display text-label text-text-secondary">
                  {entry.completedSets}/{entry.totalSets} SETS ·{" "}
                  {formatNumber(Math.round(toDisplayWeight(entry.volume, unit)))}
                </Text>
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={14}
                  color={colors.textSecondary}
                />
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-surface-raised">
                <View
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(entry.volume / maxVolume) * 100}%` }}
                />
              </View>
            </Pressable>

            {expanded ? (
              <View className="mt-1 gap-1">
                {entry.sets.map((set) => (
                  <View
                    key={set.id}
                    className="flex-row items-center gap-3 py-0.5"
                  >
                    <Text className="w-6 text-center font-display text-label text-text-secondary">
                      {set.setNumber}
                    </Text>
                    <Text className="flex-1 font-display text-body text-text-primary">
                      {toDisplayWeight(set.weight, unit)} × {set.reps}
                    </Text>
                    <Text
                      className={`font-body-medium text-label uppercase ${
                        set.completed ? "text-accent" : "text-text-secondary"
                      }`}
                    >
                      {set.completed ? "Completed" : "Skipped"}
                    </Text>
                    <Ionicons
                      name={
                        set.completed
                          ? "checkmark-circle"
                          : "close-circle-outline"
                      }
                      size={16}
                      color={
                        set.completed ? colors.accent : colors.textSecondary
                      }
                    />
                  </View>
                ))}
                {entry.sets.length === 0 ? (
                  <Text className="font-body text-label text-text-secondary">
                    No sets logged.
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams<{
    id: string;
    source?: string;
  }>();
  const { detail, loading } = useWorkoutDetail(id);
  const unit = useSettings((state) => state.weightUnit);
  // Notes are only editable when viewing a synced workout from the History
  // tab; the post-finish summary hides them entirely.
  const canEditNotes = source === "history";

  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  // Preload the stored note once the workout arrives.
  useEffect(() => {
    if (detail) {
      setNote(detail.workout.note ?? "");
    }
  }, [detail]);

  const saveNote = async () => {
    if (!detail) return;
    const updated = await workoutRepository.updateWorkoutNote(
      detail.workout.id,
      note.trim(),
    );
    // The repository returns the stored workout; if the remote write failed
    // it still holds the old note, so don't claim the save happened.
    setNoteSaved((updated.note ?? "") === note.trim());
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Text className="font-body-medium text-label uppercase text-text-secondary">
                Workout Summary
              </Text>
              <Text className="font-display text-title uppercase text-text-primary">
                {detail
                  ? formatDayHeading(new Date(detail.workout.date))
                  : "…"}
              </Text>
            </View>
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

          {!detail ? (
            <Text className="mt-16 text-center font-body text-body text-text-secondary">
              {loading ? "Loading…" : "Workout not found."}
            </Text>
          ) : (
            <View className="mt-4 gap-4">
              <View className="flex-row flex-wrap gap-2">
                {detail.muscleGroups.map((muscle) => (
                  <Chip key={muscle} label={muscle} />
                ))}
              </View>

              <Card>
                <View className="flex-row">
                  <Stat
                    value={String(detail.exerciseCount)}
                    label={detail.exerciseCount === 1 ? "Exercise" : "Exercises"}
                  />
                  <Stat
                    value={`${detail.completedSets}/${detail.totalSets}`}
                    label="Sets"
                  />
                  <Stat
                    value={formatNumber(
                      Math.round(toDisplayWeight(detail.totalVolume, unit)),
                    )}
                    label="Volume"
                  />
                  <Stat
                    value={
                      detail.durationMinutes !== null
                        ? String(detail.durationMinutes)
                        : "—"
                    }
                    label="Minutes"
                  />
                </View>
              </Card>

              <Card className="gap-4">
                <Text className="font-body-medium text-label uppercase text-text-secondary">
                  Volume by Exercise
                </Text>
                <VolumeGraph breakdown={detail.breakdown} unit={unit} />
              </Card>

              <Card className="gap-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="bulb-outline"
                    size={16}
                    color={colors.accent}
                  />
                  <Text className="font-body-medium text-label uppercase text-text-secondary">
                    Recommendation
                  </Text>
                </View>
                <Text className="font-body text-body text-text-primary">
                  {buildRecommendation(detail, unit)}
                </Text>
              </Card>

              {canEditNotes ? (
                <View className="gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-body-medium text-label uppercase text-text-secondary">
                      Notes
                    </Text>
                    {noteSaved ? (
                      <Text className="font-body-medium text-label uppercase text-accent">
                        Saved
                      </Text>
                    ) : null}
                  </View>
                  <Input
                    multiline
                    placeholder="How did this session feel?"
                    value={note}
                    onChangeText={(text) => {
                      setNote(text);
                      setNoteSaved(false);
                    }}
                    onBlur={saveNote}
                  />
                </View>
              ) : null}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
