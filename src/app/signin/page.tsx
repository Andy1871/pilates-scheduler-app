"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">Sign in</h1>
        <Button
          onClick={() => {
            setLoading(true);
            signIn("google", { callbackUrl: "/" });
          }}
          className="w-full"
          disabled={loading}
        >
          {loading ? "Authorising…" : "Continue with Google"}
        </Button>
      </div>
    </main>
  );
}
