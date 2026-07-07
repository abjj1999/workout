import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, Screen } from "@/components/ui";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen scroll={false}>
      <View className="flex-1 justify-center gap-4">
        <Text className="font-display text-title uppercase text-text-primary">
          Welcome
        </Text>
        <Text className="font-body text-body text-text-secondary">
          Onboarding will live here.
        </Text>
        <Button label="Get Started" onPress={() => router.replace("/")} />
      </View>
    </Screen>
  );
}
