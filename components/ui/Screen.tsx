import { type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. FlatList). */
  scroll?: boolean;
};

// Every tab screen renders inside this: safe area, background token, and
// 16px screen padding. Clearance for the floating tab bar is reserved
// structurally by the tab navigator's sceneStyle, so the scroll viewport
// already ends above the bar — only a small end-of-scroll breathing space
// is added here.
export function Screen({ children, scroll = true }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View className="flex-1 px-4 pb-4 pt-4">{children}</View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-background"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pt-4 pb-6"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
