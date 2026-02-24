"use client";
import { useUser as useClerkUser, SignInButton, UserButton } from "@clerk/nextjs";

export function useSafeUser() {
  try {
    const result = useClerkUser();
    return {
      isSignedIn: result.isSignedIn ?? false,
      isLoaded: result.isLoaded,
      user: result.user ?? null,
    };
  } catch {
    return { isSignedIn: false as const, isLoaded: true as const, user: null };
  }
}

export { SignInButton as SafeSignInButton, UserButton as SafeUserButton };
