import { useSSO } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";

import { ErrorText } from "@/components/auth/ErrorText";
import { Button } from "@/components/ui";
import { colors } from "@/constants/colors";

// Completes any auth session left pending when the browser redirects back
// into the app.
WebBrowser.maybeCompleteAuthSession();

type SSOStrategy = "oauth_google" | "oauth_apple";

// Browser-based Google/Apple SSO (works in Expo Go). One flow covers both
// sign-in and sign-up: Clerk creates the account on first use. On success
// the session activates and the root guards route into the app.
export function SSOButtons() {
  const { startSSOFlow } = useSSO();
  const [pending, setPending] = useState<SSOStrategy | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Warm up the Android custom tab so the browser opens instantly.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const handlePress = async (strategy: SSOStrategy) => {
    if (pending) return;
    setError(null);
    setPending(strategy);
    try {
      const { createdSessionId, setActive, authSessionResult } =
        await startSSOFlow({
          strategy,
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        return;
      }

      // User closed the browser: not an error, stay quiet.
      const resultType = authSessionResult?.type;
      if (resultType === "cancel" || resultType === "dismiss") {
        return;
      }

      // Flow returned without a session (e.g. the account requires further
      // steps like MFA that the app doesn't support yet).
      setError("Sign-in wasn't completed. Try again, or use email and password.");
    } catch {
      setError("Something went wrong signing you in. Please try again.");
    } finally {
      setPending(null);
    }
  };

  return (
    <View className="gap-3">
      <Button
        variant="ghost"
        label={
          pending === "oauth_apple" ? "Connecting…" : "Continue with Apple"
        }
        icon={<Ionicons name="logo-apple" size={18} color={colors.textPrimary} />}
        disabled={pending !== null}
        onPress={() => handlePress("oauth_apple")}
      />
      <Button
        variant="ghost"
        label={
          pending === "oauth_google" ? "Connecting…" : "Continue with Google"
        }
        icon={
          <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
        }
        disabled={pending !== null}
        onPress={() => handlePress("oauth_google")}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}
