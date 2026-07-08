import "../global.css";

import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { Oswald_700Bold } from "@expo-google-fonts/oswald";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { useSession } from "@/lib/session/useSession";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to .env.local (see Clerk Dashboard → API keys).",
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </SafeAreaProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const [fontsLoaded] = useFonts({
    Oswald_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const hydrated = useSession((state) => state.hydrated);
  const hasOnboarded = useSession((state) => state.hasOnboarded);
  const hydrate = useSession((state) => state.hydrate);
  const { isLoaded: authLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Hold the splash screen until fonts, the onboarding flag, and Clerk's
  // restored session state are all known, so the first frame is the right one.
  const ready = fontsLoaded && hydrated && authLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  const signedIn = isSignedIn === true;

  // Cold-start landing: onboarding on first launch, then auth until Clerk
  // has an active session, then the app. Signing out flips the guards back.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Protected guard={!hasOnboarded && !signedIn}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={hasOnboarded && !signedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
