import Ionicons from "@expo/vector-icons/Ionicons";
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<string, { active: IoniconName; inactive: IoniconName }> =
  {
    index: { active: "today", inactive: "today-outline" },
    history: { active: "time", inactive: "time-outline" },
    exercises: { active: "barbell", inactive: "barbell-outline" },
    profile: { active: "person", inactive: "person-outline" },
  };

// Floating pill tab bar: detached 16px from the screen edges plus the
// bottom safe-area inset, 64px tall, surface background with 1px border.
export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute left-4 right-4 h-16 flex-row items-center rounded-full border border-border bg-surface px-2"
      style={{ bottom: insets.bottom + 16 }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const focused = state.index === index;
        const icons = TAB_ICONS[route.name] ?? {
          active: "ellipse" as const,
          inactive: "ellipse-outline" as const,
        };

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            className="h-12 min-h-[48px] flex-1 items-center justify-center rounded-full"
            style={({ pressed }) =>
              pressed ? { transform: [{ scale: 0.98 }] } : undefined
            }
          >
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={22}
              color={focused ? colors.accent : colors.textSecondary}
            />
            {focused ? (
              <Text className="font-body-semibold text-label uppercase text-accent">
                {label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
