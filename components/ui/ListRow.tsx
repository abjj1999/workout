import Ionicons from "@expo/vector-icons/Ionicons";
import { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/colors";

type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  className?: string;
};

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = false,
  onPress,
  className = "",
}: ListRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      className={`h-14 flex-row items-center gap-3 ${className}`}
      style={({ pressed }) =>
        pressed ? { transform: [{ scale: 0.98 }] } : undefined
      }
    >
      {leading}
      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="font-body text-body text-text-primary"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            className="font-body text-label uppercase text-text-secondary"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
      {showChevron ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textSecondary}
        />
      ) : null}
    </Pressable>
  );
}
