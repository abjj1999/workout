import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/colors";

type StepperProps = {
  value: string | number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
};

export function Stepper({
  value,
  onIncrement,
  onDecrement,
  className = "",
}: StepperProps) {
  return (
    <View
      className={`h-12 flex-row items-center overflow-hidden rounded-btn border border-border bg-surface-raised ${className}`}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Decrease"
        onPress={onDecrement}
        className="h-12 w-12 items-center justify-center"
        style={({ pressed }) =>
          pressed ? { transform: [{ scale: 0.98 }] } : undefined
        }
      >
        <Ionicons name="remove" size={20} color={colors.textSecondary} />
      </Pressable>
      <View className="min-w-[56px] flex-1 items-center justify-center">
        <Text className="font-display text-body text-text-primary">
          {value}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase"
        onPress={onIncrement}
        className="h-12 w-12 items-center justify-center"
        style={({ pressed }) =>
          pressed ? { transform: [{ scale: 0.98 }] } : undefined
        }
      >
        <Ionicons name="add" size={20} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}
