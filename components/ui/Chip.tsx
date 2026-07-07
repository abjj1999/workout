import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text } from "react-native";

import { colors } from "@/constants/colors";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Renders a close affordance; makes this a removable chip. */
  onRemove?: () => void;
  className?: string;
};

export function Chip({
  label,
  selected = false,
  onPress,
  onRemove,
  className = "",
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityState={{ selected }}
      disabled={!onPress}
      onPress={onPress}
      hitSlop={8}
      className={`h-8 flex-row items-center gap-1 rounded-full border px-3 ${
        selected ? "border-accent bg-accent" : "border-border bg-surface-raised"
      } ${className}`}
      style={({ pressed }) =>
        pressed ? { transform: [{ scale: 0.98 }] } : undefined
      }
    >
      <Text
        className={`font-body-medium text-label uppercase ${
          selected ? "text-text-primary" : "text-text-secondary"
        }`}
      >
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          onPress={onRemove}
          hitSlop={12}
          className="-mr-1 h-5 w-5 items-center justify-center"
        >
          <Ionicons
            name="close"
            size={14}
            color={selected ? colors.textPrimary : colors.textSecondary}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
