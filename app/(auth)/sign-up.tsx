import { useAuth, useSignUp } from "@clerk/expo";
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
const MIN_PASSWORD_LENGTH = 8;

export default function SignUpScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const fetching = fetchStatus === "fetching";
  const emailValid = EMAIL_RE.test(emailAddress.trim());
  const passwordValid = password.length >= MIN_PASSWORD_LENGTH;
  const canSubmit = emailValid && passwordValid && !fetching;

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });
    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (signUp.status === "complete") {
      // Activates the new session; the root guards reroute to the app.
      await signUp.finalize();
    }
  };

  // Session became active (or already was): guards swap to the app.
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // Email verification step: account created, waiting on the emailed code.
  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
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
              Verify Your Email
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
              {errors.global?.length ? (
                <ErrorText>{errors.global[0].message}</ErrorText>
              ) : null}
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
              onPress={() => signUp.verifications.sendEmailCode()}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => signUp.reset()}
              className="h-12 items-center justify-center"
            >
              <Text className="font-body-medium text-label uppercase text-text-secondary">
                Use a Different Email
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
          contentContainerClassName="grow px-4 pb-4 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="font-display text-title uppercase text-text-primary">
            Create Account
          </Text>
          <Text className="mt-2 font-body text-body text-text-secondary">
            Track every set. See yourself progress.
          </Text>

          <View className="mt-6">
            <SSOButtons />
          </View>

          <View className="my-6 h-px bg-border" />

          <View className="gap-3">
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
              {errors.fields.emailAddress ? (
                <ErrorText>{errors.fields.emailAddress.message}</ErrorText>
              ) : null}
            </View>

            <View className="gap-2">
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                textContentType="newPassword"
              />
              {password.length > 0 && !passwordValid ? (
                <ErrorText>
                  {`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`}
                </ErrorText>
              ) : null}
              {errors.fields.password ? (
                <ErrorText>{errors.fields.password.message}</ErrorText>
              ) : null}
            </View>

            {errors.global?.length ? (
              <ErrorText>{errors.global[0].message}</ErrorText>
            ) : null}
          </View>

          {/* Required for sign-up flows: Clerk's bot protection mounts here. */}
          <View nativeID="clerk-captcha" />

          {/* Spacer pins the actions to the bottom when content is short. */}
          <View className="grow" />

          <View className="mt-8 gap-3">
            <Button
              label={fetching ? "Creating Account…" : "Create Account"}
              disabled={!canSubmit}
              onPress={handleSubmit}
            />
            <Button
              variant="ghost"
              label="I Already Have an Account"
              disabled={fetching}
              onPress={() => router.back()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
