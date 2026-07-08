import { type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { TAB_BAR_CLEARANCE } from "@/constants/layout";

type ScreenProps = {
  children: ReactNode;
  /** Set false for screens that manage their own scrolling (e.g. FlatList). */
  scroll?: boolean;
};

// Every screen renders inside this: safe area, background token, 16px screen
// padding, and enough bottom padding — computed from the device's bottom
// inset — that the last element scrolls clear of the floating tab bar.
export function Screen({ children, scroll = true }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + TAB_BAR_CLEARANCE;

  if (!scroll) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="flex-1 bg-background"
      >
        <View
          className="flex-1 px-4 pt-4"
          style={{ paddingBottom: bottomPadding }}
        >
          {children}
        </View>
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
        contentContainerClassName="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
