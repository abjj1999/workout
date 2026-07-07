import { useRouter } from "expo-router";
import { Text, View } from "react-native";

import { Button, Screen } from "@/components/ui";

export default function SignInScreen() {
  const router = useRouter();

  return (
    <Screen scroll={false}>
      <View className="flex-1 justify-center gap-4">
        <Text className="font-display text-title uppercase text-text-primary">
          Sign In
        </Text>
        <Text className="font-body text-body text-text-secondary">
          Auth will live here.
        </Text>
        <Button label="Continue" onPress={() => router.replace("/")} />
        <Button
          label="Create Account"
          variant="ghost"
          onPress={() => router.replace("/")}
        />
      </View>
    </Screen>
  );
}
