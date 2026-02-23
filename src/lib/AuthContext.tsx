"use client";

import { createContext, useContext, type ReactNode } from "react";

interface AuthContextValue {
  isSignedIn: boolean;
  userId: string | null;
}

const AuthContext = createContext<AuthContextValue>({
  isSignedIn: false,
  userId: null,
});

export function AuthProvider({
  children,
  isSignedIn,
  userId,
}: {
  children: ReactNode;
  isSignedIn: boolean;
  userId: string | null;
}) {
  return (
    <AuthContext.Provider value={{ isSignedIn, userId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  return useContext(AuthContext);
}
