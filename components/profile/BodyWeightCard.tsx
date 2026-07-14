import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Button, Card, Input, Skeleton, SkeletonPulse } from "@/components/ui";
import { colors } from "@/constants/colors";
import type { BodyWeightEntry } from "@/lib/data/remote/bodyWeightApi";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight, toStoredWeight } from "@/lib/units";

// Latest weigh-in and an inline field to log today's weight. Tapping the
// current weight opens the full progression screen.
export function BodyWeightCard({
  entries,
  loading,
  onLog,
  onOpenHistory,
}: {
  entries: BodyWeightEntry[];
  loading: boolean;
  onLog: (weight: number) => Promise<void>;
  onOpenHistory: () => void;
}) {
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unit = useSettings((state) => state.weightUnit);

  const latest = entries[0];
  const previous = entries[1];
  const delta =
    latest && previous
      ? toDisplayWeight(latest.weight, unit) -
        toDisplayWeight(previous.weight, unit)
      : null;

  const handleLog = async () => {
    const typed = Number(input.replace(",", "."));
    // Stored canonically in lbs regardless of the display unit.
    const weight = toStoredWeight(typed, unit);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 2000) {
      setError("Enter a valid weight.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onLog(weight);
      setInput("");
    } catch (logError) {
      console.warn("Failed to log body weight:", logError);
      setError("Couldn't save. Check your connection and retry.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SkeletonPulse>
        <Card className="mt-4 gap-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-12" />
        </Card>
      </SkeletonPulse>
    );
  }

  return (
    <Card className="mt-4 gap-4">
      <Text className="font-body-medium text-label uppercase text-text-secondary">
        Body Weight
      </Text>

      {latest ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View body weight progression"
          onPress={onOpenHistory}
          className="flex-row items-center justify-between"
          style={({ pressed }) =>
            pressed ? { transform: [{ scale: 0.98 }] } : undefined
          }
        >
          <View className="flex-row items-end gap-2">
            <Text className="font-display text-title text-text-primary">
              {toDisplayWeight(latest.weight, unit)}
            </Text>
            <Text className="mb-1 font-body text-label uppercase text-text-secondary">
              {unit}
            </Text>
            {delta !== null && delta !== 0 ? (
              <Text
                className={`mb-1 font-body-semibold text-label ${
                  delta < 0 ? "text-accent" : "text-text-secondary"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {Math.round(delta * 10) / 10}
              </Text>
            ) : null}
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="font-body-medium text-label uppercase text-text-secondary">
              Progress
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.textSecondary}
            />
          </View>
        </Pressable>
      ) : (
        <Text className="font-body text-body text-text-secondary">
          Log your first weigh-in to start the trend.
        </Text>
      )}

      <View className="flex-row items-center gap-2">
        <Input
          placeholder={`Today's weight (${unit})`}
          value={input}
          onChangeText={(text) => {
            setInput(text);
            setError(null);
          }}
          keyboardType="decimal-pad"
          className="flex-1"
        />
        <Button
          label="Log"
          loading={saving}
          disabled={input.trim().length === 0}
          onPress={handleLog}
        />
      </View>
      {error ? (
        <Text className="font-body text-label text-accent">{error}</Text>
      ) : null}
    </Card>
  );
}
