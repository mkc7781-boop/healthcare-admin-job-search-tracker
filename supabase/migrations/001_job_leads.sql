-- Region enum
CREATE TYPE region_enum AS ENUM (
  'sacramento',
  'bay_area',
  'northern_california',
  'government',
  'state_of_california',
  'remote'
);

-- Priority enum
CREATE TYPE priority_enum AS ENUM ('high', 'medium', 'low');

-- Status enum
CREATE TYPE status_enum AS ENUM (
  'need_to_apply',
  'applied',
  'interviewing',
  'rejected'
);

-- Job leads table
CREATE TABLE job_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  region region_enum NOT NULL,
  employer TEXT NOT NULL,
  career_site TEXT,
  position TEXT,
  city TEXT,
  min_requirements TEXT,
  priority priority_enum NOT NULL DEFAULT 'medium',
  status status_enum NOT NULL DEFAULT 'need_to_apply',
  date_applied DATE,
  follow_up_date DATE,
  due_date DATE,
  contact_recruiter TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX job_leads_user_region_idx ON job_leads (user_id, region);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_leads_updated_at
  BEFORE UPDATE ON job_leads
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 10-lead cap per region per user
CREATE OR REPLACE FUNCTION enforce_region_lead_limit()
RETURNS TRIGGER AS $$
DECLARE
  lead_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO lead_count
  FROM job_leads
  WHERE user_id = NEW.user_id AND region = NEW.region;

  IF lead_count >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 leads per region reached for %', NEW.region;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_leads_region_limit
  BEFORE INSERT ON job_leads
  FOR EACH ROW
  EXECUTE FUNCTION enforce_region_lead_limit();

-- Row Level Security
ALTER TABLE job_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads"
  ON job_leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON job_leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON job_leads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON job_leads FOR DELETE
  USING (auth.uid() = user_id);