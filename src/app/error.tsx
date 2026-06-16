"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  const message =
    error.message && !error.message.includes("omitted in production")
      ? error.message
      : "Something went wrong loading your tracker.";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm">
        <h1 className="text-xl font-bold">Unable to load tracker</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{message}</p>
        <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-[var(--color-muted-foreground)]">
          <li>Sign out and sign back in</li>
          <li>Confirm the Supabase database migration was run</li>
          <li>Check Vercel environment variables are set</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          <Button variant="outline" onClick={() => (window.location.href = "/login")}>
            Go to Sign In
          </Button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-[var(--color-muted-foreground)]">
            Error reference: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}