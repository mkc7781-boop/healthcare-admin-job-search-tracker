import { redirect } from "next/navigation";
import { isCloudMode } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUserId(): Promise<string | null> {
  if (!isCloudMode()) return null;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user.id;
}

/** Redirects to /login when cloud mode has no session. */
export async function requireAuthenticatedUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  if (!userId) redirect("/login");
  return userId;
}