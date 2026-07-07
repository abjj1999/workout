import { Pressable, Text, type PressableProps } from "react-native";

type ButtonProps = Omit<PressableProps, "style"> & {
  label: string;
  variant?: "primary" | "ghost";
  className?: string;
};

export function Button({
  label,
  variant = "primary",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled === true }}
      disabled={disabled}
      className={`h-12 min-h-[48px] flex-row items-center justify-center rounded-btn px-6 ${
        variant === "primary" ? "bg-accent" : "border border-border"
      } ${disabled ? "opacity-40" : ""} ${className}`}
      style={({ pressed }) =>
        pressed ? { transform: [{ scale: 0.98 }] } : undefined
      }
      {...props}
    >
      <Text className="font-body-semibold text-body text-text-primary">
        {label}
      </Text>
    </Pressable>
  );
}
