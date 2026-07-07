import { Pressable, Text, View } from "react-native";

type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: SegmentedControlProps<T>) {
  return (
    <View
      className={`h-12 flex-row overflow-hidden rounded-btn border border-border bg-surface ${className}`}
    >
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            className={`h-12 min-h-[48px] flex-1 items-center justify-center ${
              selected ? "bg-surface-raised" : ""
            }`}
            style={({ pressed }) =>
              pressed ? { transform: [{ scale: 0.98 }] } : undefined
            }
          >
            <Text
              className={`font-body-semibold text-label uppercase ${
                selected ? "text-accent" : "text-text-secondary"
              }`}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
