import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/colors";

type StepperProps = {
  value: string | number;
  onIncrement: () => void;
  onDecrement: () => void;
  /** Makes the value itself tappable (e.g. to switch to direct input). */
  onValuePress?: () => void;
  className?: string;
};

export function Stepper({
  value,
  onIncrement,
  onDecrement,
  onValuePress,
  className = "",
}: StepperProps) {
  const valueText = (
    <Text className="font-display text-body text-text-primary">{value}</Text>
  );

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
      {onValuePress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enter value"
          onPress={onValuePress}
          className="h-12 min-w-[56px] flex-1 items-center justify-center"
        >
          {valueText}
        </Pressable>
      ) : (
        <View className="min-w-[56px] flex-1 items-center justify-center">
          {valueText}
        </View>
      )}
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
