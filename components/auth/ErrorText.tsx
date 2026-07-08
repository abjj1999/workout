import { Text } from "react-native";

// Inline form error, rendered under the field it belongs to.
export function ErrorText({ children }: { children: string }) {
  return (
    <Text
      accessibilityLiveRegion="polite"
      className="font-body text-label text-accent"
    >
      {children}
    </Text>
  );
}
