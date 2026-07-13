import { useEffect, useRef, type ReactNode } from "react";
import { Animated, View } from "react-native";

/**
 * Pulses its children while content loads. Wrap a group of Skeleton blocks
 * in a single SkeletonPulse so they fade in sync.
 */
export function SkeletonPulse({ children }: { children: ReactNode }) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

/** A placeholder block; size it with className (h-*, w-*, rounded-*). */
export function Skeleton({ className = "" }: { className?: string }) {
  return <View className={`rounded-lg bg-surface-raised ${className}`} />;
}
