-- Remove the 10-lead-per-region database cap so users can add unlimited leads.

DROP TRIGGER IF EXISTS job_leads_region_limit ON job_leads;
DROP FUNCTION IF EXISTS enforce_region_lead_limit();
