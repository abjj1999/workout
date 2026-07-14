import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FloatingTabBar } from "@/components/FloatingTabBar";
import { colors } from "@/constants/colors";
import {
  TAB_BAR_CONTENT_GAP,
  TAB_BAR_HEIGHT,
  TAB_BAR_MARGIN,
} from "@/constants/layout";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  // Reserve the tab bar's zone at the bottom of every scene: screens end
  // above the floating pill, so no content can scroll behind or below it.
  const tabBarZone =
    insets.bottom + TAB_BAR_MARGIN + TAB_BAR_HEIGHT + TAB_BAR_CONTENT_GAP;

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
          paddingBottom: tabBarZone,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Today" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="routines" options={{ title: "Routines" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
