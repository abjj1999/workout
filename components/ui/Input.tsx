import { TextInput, type TextInputProps } from "react-native";

import { colors } from "@/constants/colors";

type InputProps = TextInputProps & {
  className?: string;
};

// Shared text field: surface background, 1px border, radius 8 (matching the
// design system's input radius), 48px tall, Inter body text.
export function Input({ className = "", ...props }: InputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textSecondary}
      className={`h-12 min-h-[48px] rounded-btn border border-border bg-surface px-4 font-body text-body text-text-primary ${className}`}
      {...props}
    />
  );
}
