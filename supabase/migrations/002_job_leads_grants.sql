-- Required on newer Supabase projects: explicit grants for the Data API.
-- Run this if you see "permission denied for table job_leads".

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT USAGE ON TYPE public.region_enum TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.priority_enum TO anon, authenticated, service_role;
GRANT USAGE ON TYPE public.status_enum TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.job_leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.job_leads TO service_role;