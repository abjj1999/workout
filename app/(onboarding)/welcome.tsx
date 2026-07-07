import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { useSession } from "@/lib/session/useSession";

type Slide = {
  key: string;
  title: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    key: "muscle",
    title: "Pick your muscle",
    body: "Choose a muscle group and pull up the exercises that train it.",
  },
  {
    key: "log",
    title: "Log every set",
    body: "Track weight and reps for each set the moment you finish it.",
  },
  {
    key: "progress",
    title: "Watch yourself progress",
    body: "See your numbers climb week after week in your history.",
  },
];

// A flat, token-only phone outline with a skeleton "screenshot" inside.
// No photos, illustrations, or depth — just framed placeholder blocks.
function DeviceFrame() {
  return (
    <View className="h-80 w-44 rounded-[36px] border-2 border-border bg-surface p-2">
      <View className="flex-1 overflow-hidden rounded-[28px] border border-border bg-surface-raised">
        {/* status bar / notch hint */}
        <View className="items-center py-2">
          <View className="h-1.5 w-12 rounded-full bg-border" />
        </View>
        {/* header block */}
        <View className="gap-2 px-3">
          <View className="h-4 w-24 rounded bg-border" />
          <View className="h-2 w-16 rounded bg-border" />
        </View>
        {/* accented primary block, hinting at the app's content */}
        <View className="mx-3 mt-4 h-16 rounded-card bg-accent" />
        {/* list skeleton rows */}
        <View className="mt-3 gap-2 px-3">
          <View className="h-8 rounded-btn border border-border bg-surface" />
          <View className="h-8 rounded-btn border border-border bg-surface" />
          <View className="h-8 rounded-btn border border-border bg-surface" />
        </View>
      </View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const completeOnboarding = useSession((state) => state.completeOnboarding);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace("/(auth)/sign-in");
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) {
      setIndex(next);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      {/* Skip — top right, jumps straight to auth */}
      <View className="h-12 flex-row items-center justify-end px-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          onPress={finish}
          hitSlop={12}
          className="h-12 justify-center px-2"
        >
          <Text className="font-body-medium text-label uppercase text-text-secondary">
            Skip
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <View
            style={{ width }}
            className="flex-1 items-center justify-center px-4"
          >
            <DeviceFrame />
            <Text className="mt-10 text-center font-display text-title uppercase text-text-primary">
              {item.title}
            </Text>
            <Text className="mt-3 max-w-xs text-center font-body text-body text-text-secondary">
              {item.body}
            </Text>
          </View>
        )}
      />

      {/* Footer: progress dots, plus Get Started on the last slide only */}
      <View className="gap-6 px-4 pb-4 pt-2">
        <View className="flex-row items-center justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <View
              key={slide.key}
              className={`h-2 rounded-full ${
                i === index ? "w-6 bg-accent" : "w-2 bg-border"
              }`}
            />
          ))}
        </View>
        {isLast ? <Button label="Get Started" onPress={finish} /> : null}
      </View>
    </SafeAreaView>
  );
}
