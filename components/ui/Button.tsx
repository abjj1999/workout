import { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
} from "react-native";

import { colors } from "@/constants/colors";

type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: "primary" | "ghost";
  /** Optional leading element (e.g. an icon) rendered before the label. */
  icon?: ReactNode;
  /** Shows a spinner and disables the button while an action runs. */
  loading?: boolean;
  className?: string;
};

export function Button({
  label,
  variant = "primary",
  icon,
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled === true || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`h-12 min-h-[48px] flex-row items-center justify-center gap-2 rounded-btn px-6 ${
        variant === "primary" ? "bg-accent" : "border border-border"
      } ${isDisabled ? "opacity-40" : ""} ${className}`}
      style={({ pressed }) =>
        pressed ? { transform: [{ scale: 0.98 }] } : undefined
      }
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textPrimary} />
      ) : (
        icon
      )}
      <Text className="font-body-semibold text-body text-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}
