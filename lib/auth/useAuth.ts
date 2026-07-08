import { useAuth as useClerkAuth, useUser } from "@clerk/expo";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}

// Thin adapter over Clerk so screens keep consuming one stable interface
// instead of Clerk's hooks directly.
export function useAuth(): AuthState {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth();
  const { user } = useUser();

  const email =
    user?.primaryEmailAddress?.emailAddress ??
    user?.emailAddresses?.[0]?.emailAddress ??
    "";

  return {
    user: user
      ? {
          id: user.id,
          email,
          name:
            user.fullName ??
            user.firstName ??
            (email ? email.split("@")[0] : "Athlete"),
        }
      : null,
    isLoaded,
    isSignedIn: isSignedIn === true,
    signOut: async () => {
      await signOut();
    },
  };
}
