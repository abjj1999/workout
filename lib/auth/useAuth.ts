export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const STUB_USER: AuthUser = {
  id: "user_1",
  email: "abdullah@example.com",
  name: "Abdullah",
};

// Stub matching the shape screens will need. Swap the internals for Clerk
// later; consumers only depend on AuthState.
export function useAuth(): AuthState {
  return {
    user: STUB_USER,
    isLoaded: true,
    isSignedIn: true,
    signIn: async () => {},
    signOut: async () => {},
  };
}
