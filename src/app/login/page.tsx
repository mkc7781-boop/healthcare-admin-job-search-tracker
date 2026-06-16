"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      setMessage("Account created. You can sign in now.");
      setMode("signin");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <h1 className="text-xl font-bold">Healthcare Admin Job Tracker</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Sign in to access your tracker from any device.
        </p>

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("signin")}
          >
            Sign In
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("signup")}
          >
            Sign Up
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
          {message && <p className="text-sm text-emerald-700">{message}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}