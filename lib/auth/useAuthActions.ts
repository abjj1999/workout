import { useRouter } from "expo-router";
import { useCallback } from "react";

import { useSession } from "../session/useSession";
import { useAuth } from "./useAuth";

// Composes the (stubbed) auth call with the session gate and navigation, so
// every auth entry point behaves identically. Swapping useAuth for a real
// provider later needs no change here.
export function useAuthActions() {
  const router = useRouter();
  const { signIn } = useAuth();
  const enterApp = useSession((state) => state.enterApp);

  const authenticate = useCallback(async () => {
    await signIn();
    enterApp();
    router.replace("/(tabs)");
  }, [signIn, enterApp, router]);

  return { authenticate };
}
