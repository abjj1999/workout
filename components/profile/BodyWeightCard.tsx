import { useState } from "react";
import { Text, View } from "react-native";

import { Button, Card, Input, Skeleton, SkeletonPulse } from "@/components/ui";
import type { BodyWeightEntry } from "@/lib/data/remote/bodyWeightApi";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight, toStoredWeight } from "@/lib/units";

const SPARK_BARS = 14;

// Latest weigh-in, change vs the previous one, a mini bar trend of recent
// entries, and an inline field to log today's weight.
export function BodyWeightCard({
  entries,
  loading,
  onLog,
}: {
  entries: BodyWeightEntry[];
  loading: boolean;
  onLog: (weight: number) => Promise<void>;
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

  // Oldest → newest for the trend bars.
  const trend = entries.slice(0, SPARK_BARS).reverse();
  const min = Math.min(...trend.map((entry) => entry.weight));
  const max = Math.max(...trend.map((entry) => entry.weight));

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
        <View className="flex-row items-end justify-between">
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

          {trend.length > 1 ? (
            <View className="h-12 flex-row items-end gap-1">
              {trend.map((entry, index) => {
                const ratio =
                  max === min ? 0.6 : (entry.weight - min) / (max - min);
                return (
                  <View
                    key={entry.id}
                    className={`w-2 rounded-full ${
                      index === trend.length - 1 ? "bg-accent" : "bg-border"
                    }`}
                    style={{ height: 12 + ratio * 36 }}
                  />
                );
              })}
            </View>
          ) : null}
        </View>
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
