import { useAuth, useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ErrorText } from "@/components/auth/ErrorText";
import { SSOButtons } from "@/components/auth/SSOButtons";
import { Button, Input } from "@/components/ui";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const fetching = fetchStatus === "fetching";
  const emailValid = EMAIL_RE.test(emailAddress.trim());
  const canSubmit = emailValid && password.length > 0 && !fetching;

  const handleSubmit = async () => {
    setFormError(null);
    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (error) return; // Clerk field/global errors render below

    if (signIn.status === "complete") {
      // Activates the session; the root guards reroute to the app.
      await signIn.finalize();
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      } else {
        setFormError("This device needs verification, but no email factor is available.");
      }
    } else if (signIn.status === "needs_second_factor") {
      setFormError(
        "This account uses two-factor authentication, which isn't supported in the app yet.",
      );
    }
  };

  const handleVerify = async () => {
    setFormError(null);
    await signIn.mfa.verifyEmailCode({ code: code.trim() });
    if (signIn.status === "complete") {
      await signIn.finalize();
    }
  };

  // Session already active (or just became active): guards swap to the app.
  if (isSignedIn) {
    return null;
  }

  // New-device verification: Clerk emailed a code to confirm this client.
  if (signIn.status === "needs_client_trust") {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow justify-center gap-4 px-4 py-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text className="font-display text-title uppercase text-text-primary">
              Check Your Email
            </Text>
            <Text className="font-body text-body text-text-secondary">
              We sent a verification code to {emailAddress.trim()}.
            </Text>
            <View className="gap-2">
              <Input
                placeholder="Verification code"
                value={code}
                onChangeText={setCode}
                keyboardType="numeric"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                autoFocus
              />
              {errors.fields.code ? (
                <ErrorText>{errors.fields.code.message}</ErrorText>
              ) : null}
              {formError ? <ErrorText>{formError}</ErrorText> : null}
            </View>
            <Button
              label={fetching ? "Verifying…" : "Verify"}
              disabled={code.trim().length === 0 || fetching}
              onPress={handleVerify}
            />
            <Button
              variant="ghost"
              label="Send a New Code"
              disabled={fetching}
              onPress={() => signIn.mfa.sendEmailCode()}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => signIn.reset()}
              className="h-12 items-center justify-center"
            >
              <Text className="font-body-medium text-label uppercase text-text-secondary">
                Start Over
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow justify-center gap-10 px-4 py-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center gap-2">
            <Text className="font-display text-title uppercase text-text-primary">
              Ironlog
            </Text>
            <Text className="font-body text-body text-text-secondary">
              Train hard. Track everything.
            </Text>
          </View>

          <View className="gap-3">
            <SSOButtons />

            <View className="my-1 h-px bg-border" />

            <View className="gap-2">
              <Input
                placeholder="Email"
                value={emailAddress}
                onChangeText={setEmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
              {emailAddress.length > 0 && !emailValid ? (
                <ErrorText>Enter a valid email address.</ErrorText>
              ) : null}
              {errors.fields.identifier ? (
                <ErrorText>{errors.fields.identifier.message}</ErrorText>
              ) : null}
            </View>

            <View className="gap-2">
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                onSubmitEditing={() => {
                  if (canSubmit) handleSubmit();
                }}
              />
              {errors.fields.password ? (
                <ErrorText>{errors.fields.password.message}</ErrorText>
              ) : null}
            </View>

            {errors.global?.length ? (
              <ErrorText>{errors.global[0].message}</ErrorText>
            ) : null}
            {formError ? <ErrorText>{formError}</ErrorText> : null}

            <Button
              label={fetching ? "Signing In…" : "Sign In"}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />

            <View className="my-1 h-px bg-border" />

            <Button
              variant="ghost"
              label="Create Account"
              disabled={fetching}
              onPress={() => router.push("/(auth)/sign-up")}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
