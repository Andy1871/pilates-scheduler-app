"use client";

export const dynamic = "force-dynamic";


import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);


  if (status === "loading") {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <p>Checking authentication…</p>
      </main>
    );
  }

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
