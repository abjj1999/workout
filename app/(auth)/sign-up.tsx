import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input, SegmentedControl, Stepper } from "@/components/ui";
import { useAuthActions } from "@/lib/auth/useAuthActions";

const UNITS = ["LBS", "KG"] as const;
type Unit = (typeof UNITS)[number];

const MIN_DAYS = 1;
const MAX_DAYS = 7;

export default function SignUpScreen() {
  const { authenticate } = useAuthActions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [units, setUnits] = useState<Unit>("LBS");
  const [days, setDays] = useState(4);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow px-4 pb-4 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-display text-title uppercase text-text-primary">
            Create Account
          </Text>

          <View className="mt-6 gap-3">
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
            />
          </View>

          <View className="my-6 h-px bg-border" />

          {/* Optional setup — the account is created without touching this. */}
          <Text className="font-body-medium text-label uppercase text-text-secondary">
            Optional setup
          </Text>

          <View className="mt-4 gap-5">
            <View className="gap-2">
              <Text className="font-body-medium text-label uppercase text-text-secondary">
                Units
              </Text>
              <SegmentedControl
                options={UNITS}
                value={units}
                onChange={setUnits}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="font-body-medium text-label uppercase text-text-secondary">
                Training days / week
              </Text>
              <Stepper
                value={days}
                onIncrement={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
                onDecrement={() => setDays((d) => Math.max(MIN_DAYS, d - 1))}
                className="w-40"
              />
            </View>
          </View>

          {/* Spacer pins the button to the bottom when content is short. */}
          <View className="grow" />

          <Button
            label="Create Account"
            onPress={() => authenticate()}
            className="mt-8"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
