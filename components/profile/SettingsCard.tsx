import { Text, View } from "react-native";

import { Card, Chip } from "@/components/ui";
import { useSettings } from "@/lib/settings/useSettings";

// Per-device preferences. Weights are stored in lbs; switching the unit
// only changes what's displayed and typed.
export function SettingsCard() {
  const weightUnit = useSettings((state) => state.weightUnit);
  const setWeightUnit = useSettings((state) => state.setWeightUnit);

  return (
    <Card className="mt-4 gap-3">
      <Text className="font-body-medium text-label uppercase text-text-secondary">
        Settings
      </Text>
      <View className="flex-row items-center justify-between">
        <Text className="font-body text-body text-text-primary">
          Weight unit
        </Text>
        <View className="flex-row gap-2">
          <Chip
            label="lbs"
            selected={weightUnit === "lbs"}
            onPress={() => setWeightUnit("lbs")}
          />
          <Chip
            label="kg"
            selected={weightUnit === "kg"}
            onPress={() => setWeightUnit("kg")}
          />
        </View>
      </View>
    </Card>
  );
}
