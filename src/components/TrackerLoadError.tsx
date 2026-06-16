"use client";

import { Button } from "@/components/ui/button";

interface TrackerLoadErrorProps {
  message: string;
}

export function TrackerLoadError({ message }: TrackerLoadErrorProps) {
  const isAuthError =
    message.includes("Not signed in") ||
    message.includes("Authentication") ||
    message.includes("JWT");

  const isConfigError =
    message.includes("environment variables") ||
    message.includes("Cloud database not configured");

  const isDbError =
    message.includes("Database table missing") ||
    message.includes("Database permissions missing") ||
    message.includes("permission denied") ||
    message.includes("job_leads") ||
    message.includes("relation");

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <h1 className="text-xl font-bold">Unable to load tracker</h1>
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-900">{message}</p>

        {isConfigError && (
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            In Vercel → Settings → Environment Variables, add your Supabase URL and keys, then
            redeploy.
          </p>
        )}

        {isDbError && (
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            In Supabase → SQL Editor, run{" "}
            <code className="rounded bg-black/5 px-1">002_job_leads_grants.sql</code> (or the full
            migration if the table is missing).
          </p>
        )}

        {isAuthError && (
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
            Sign in with the same email and password you created in Supabase.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => (window.location.href = "/login")}>
            Go to Sign In
          </Button>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </div>
      </div>
    </div>
  );
}