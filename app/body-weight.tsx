import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card, Skeleton, SkeletonPulse } from "@/components/ui";
import { colors } from "@/constants/colors";
import type { BodyWeightEntry } from "@/lib/data/remote/bodyWeightApi";
import { formatShortDate } from "@/lib/dates";
import { useBodyWeight } from "@/lib/hooks/useBodyWeight";
import { useSettings } from "@/lib/settings/useSettings";
import { toDisplayWeight, type WeightUnit } from "@/lib/units";

const CHART_HEIGHT = 192;
const CHART_PADDING = { top: 16, bottom: 24, left: 40, right: 12 };
const DOT_SIZE = 8;
const LINE_WIDTH = 2;

// Line chart built from plain Views: a dot per weigh-in, connected by
// rotated segments. Keeps the app dependency-free (no SVG/chart lib).
function TrendChart({
  entries,
  unit,
}: {
  entries: BodyWeightEntry[];
  unit: WeightUnit;
}) {
  const [width, setWidth] = useState(0);

  // Oldest → newest so the line reads left to right.
  const ordered = [...entries].reverse();
  const weights = ordered.map((entry) => toDisplayWeight(entry.weight, unit));
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = max - min || 1;

  const innerWidth = width - CHART_PADDING.left - CHART_PADDING.right;
  const innerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const points = weights.map((weight, index) => ({
    x:
      CHART_PADDING.left +
      (ordered.length === 1 ? innerWidth / 2 : (index / (ordered.length - 1)) * innerWidth),
    y: CHART_PADDING.top + (1 - (weight - min) / range) * innerHeight,
  }));

  return (
    <View
      style={{ height: CHART_HEIGHT }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
    >
      {width > 0 ? (
        <>
          {/* Y-axis extremes */}
          <Text
            className="absolute left-0 font-display text-label text-text-secondary"
            style={{ top: CHART_PADDING.top - 8 }}
          >
            {max}
          </Text>
          <Text
            className="absolute left-0 font-display text-label text-text-secondary"
            style={{ top: CHART_HEIGHT - CHART_PADDING.bottom - 8 }}
          >
            {min}
          </Text>

          {/* Connecting segments, centered on each pair's midpoint. */}
          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];
            const dx = next.x - point.x;
            const dy = next.y - point.y;
            const length = Math.hypot(dx, dy);
            const angle = Math.atan2(dy, dx);
            return (
              <View
                key={ordered[index].id}
                className="absolute rounded-full bg-accent"
                style={{
                  width: length,
                  height: LINE_WIDTH,
                  left: (point.x + next.x) / 2 - length / 2,
                  top: (point.y + next.y) / 2 - LINE_WIDTH / 2,
                  transform: [{ rotate: `${angle}rad` }],
                }}
              />
            );
          })}

          {/* Dots on top of the line. */}
          {points.map((point, index) => (
            <View
              key={ordered[index].id}
              className={`absolute rounded-full ${
                index === points.length - 1 ? "bg-text-primary" : "bg-accent"
              }`}
              style={{
                width: DOT_SIZE,
                height: DOT_SIZE,
                left: point.x - DOT_SIZE / 2,
                top: point.y - DOT_SIZE / 2,
              }}
            />
          ))}

          {/* X-axis first/last dates */}
          <Text
            className="absolute bottom-0 font-body text-label text-text-secondary"
            style={{ left: CHART_PADDING.left }}
          >
            {formatShortDate(new Date(ordered[0].loggedAt))}
          </Text>
          <Text
            className="absolute bottom-0 right-0 font-body text-label text-text-secondary"
          >
            {formatShortDate(new Date(ordered[ordered.length - 1].loggedAt))}
          </Text>
        </>
      ) : null}
    </View>
  );
}

export default function BodyWeightScreen() {
  const router = useRouter();
  const { entries, loading } = useBodyWeight();
  const unit = useSettings((state) => state.weightUnit);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 px-4 pt-4">
        <View className="flex-row items-center gap-2">
          <Text className="flex-1 font-display text-title uppercase text-text-primary">
            Body Weight
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

        {loading ? (
          <SkeletonPulse>
            <Card className="mt-4">
              <Skeleton className="h-48" />
            </Card>
            <View className="mt-4 gap-3">
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
              <Skeleton className="h-6" />
            </View>
          </SkeletonPulse>
        ) : entries.length === 0 ? (
          <Text className="mt-16 text-center font-body text-body text-text-secondary">
            No weigh-ins yet. Log your weight from the Profile tab to start
            the graph.
          </Text>
        ) : (
          <ScrollView
            className="mt-4 flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="gap-4 pb-6"
          >
            {entries.length > 1 ? (
              <Card>
                <TrendChart entries={entries} unit={unit} />
              </Card>
            ) : (
              <Card>
                <Text className="font-body text-body text-text-secondary">
                  Log one more weigh-in and the graph starts here.
                </Text>
              </Card>
            )}

            <Card className="gap-3">
              <Text className="font-body-medium text-label uppercase text-text-secondary">
                History
              </Text>
              {entries.map((entry, index) => {
                const older = entries[index + 1];
                const delta = older
                  ? Math.round(
                      (toDisplayWeight(entry.weight, unit) -
                        toDisplayWeight(older.weight, unit)) *
                        10,
                    ) / 10
                  : null;
                return (
                  <View key={entry.id} className="flex-row items-center gap-2">
                    <Text className="flex-1 font-body text-body text-text-primary">
                      {formatShortDate(new Date(entry.loggedAt))}
                    </Text>
                    {delta !== null && delta !== 0 ? (
                      <Text
                        className={`font-body-semibold text-label ${
                          delta < 0 ? "text-accent" : "text-text-secondary"
                        }`}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta}
                      </Text>
                    ) : null}
                    <Text className="font-display text-body text-text-primary">
                      {toDisplayWeight(entry.weight, unit)} {unit}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
