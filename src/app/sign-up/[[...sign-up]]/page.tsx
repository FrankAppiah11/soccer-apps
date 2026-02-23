"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-4xl mb-3">⚽</p>
          <h1 className="text-2xl font-bold text-text-primary">SubManager</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Fair Soccer Substitutions
          </p>
        </div>
        <SignUp
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: "#3cff5a",
              colorBackground: "#111a24",
              colorText: "#eef2f6",
              colorTextSecondary: "#7b8fa3",
              colorInputBackground: "#1a2736",
              colorInputText: "#eef2f6",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "shadow-none border border-border-color",
              formButtonPrimary:
                "bg-accent hover:bg-accent-dim text-bg-primary font-bold",
            },
          }}
        />
      </div>
    </div>
  );
}
