export function isCloudMode(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getTrackerOwnerUserId(): string | null {
  return process.env.TRACKER_OWNER_USER_ID ?? null;
}