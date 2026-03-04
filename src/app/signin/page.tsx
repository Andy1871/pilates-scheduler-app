"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <p className="text-muted-foreground">Checking authentication…</p>
      </main>
    );
  }

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCredLoading(true);
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setCredLoading(false);
    if (result?.error) {
      setError("Incorrect username or password.");
    } else {
      window.location.href = "/";
    }
  };

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Pilates Scheduler</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
            A scheduling tool built for self-employed Pilates instructors. Manage
            client sessions, set recurring bookings, block time off, and view
            your week or month at a glance.
          </p>
        </div>

        {/* Demo credentials callout */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-2">
          <p className="text-sm font-semibold text-blue-900">Try it out — no sign-up needed</p>
          <div className="text-sm text-blue-800 space-y-0.5">
            <p><span className="font-medium">Username:</span> TestUser</p>
            <p><span className="font-medium">Password:</span> TestUserPassword</p>
          </div>
          <p className="text-xs text-blue-700 pt-1">
            This is a shared demo account. Feel free to add, edit, and delete
            bookings — it&apos;s there to explore.
          </p>
        </div>

        {/* Sign-in card */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">

          {/* Google */}
          <div>
            <Button
              onClick={() => {
                setGoogleLoading(true);
                signIn("google", { callbackUrl: "/" });
              }}
              className="w-full"
              variant="outline"
              disabled={googleLoading || credLoading}
            >
              {googleLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Authorising…</>
                : <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </>
              }
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Credentials form */}
          <form onSubmit={handleCredentials} className="space-y-3">
            <div>
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. TestUser"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              disabled={credLoading || googleLoading}
            >
              {credLoading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
                : "Sign in"
              }
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Sign in with Google to create your own private calendar.
        </p>
      </div>
    </main>
  );
}
