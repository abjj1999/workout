import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { colors } from "@/constants/colors";
import { useAuthActions } from "@/lib/auth/useAuthActions";

export default function SignInScreen() {
  const router = useRouter();
  const { authenticate } = useAuthActions();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 justify-center gap-10 px-4">
        <View className="items-center gap-2">
          <Text className="font-display text-title uppercase text-text-primary">
            Ironlog
          </Text>
          <Text className="font-body text-body text-text-secondary">
            Train hard. Track everything.
          </Text>
        </View>

        <View className="gap-3">
          <Button
            variant="ghost"
            label="Continue with Apple"
            icon={
              <Ionicons name="logo-apple" size={18} color={colors.textPrimary} />
            }
            onPress={() => authenticate()}
          />
          <Button
            variant="ghost"
            label="Continue with Google"
            icon={
              <Ionicons
                name="logo-google"
                size={18}
                color={colors.textPrimary}
              />
            }
            onPress={() => authenticate()}
          />

          <View className="my-1 h-px bg-border" />

          <Button
            label="Continue with Email"
            onPress={() => router.push("/(auth)/sign-up")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
