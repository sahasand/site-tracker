-- Studies table
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  protocol_number TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('I', 'II', 'III', 'IV')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  target_enrollment INTEGER NOT NULL DEFAULT 0,
  enrollment_start_date DATE,
  planned_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  site_number TEXT NOT NULL,
  name TEXT NOT NULL,
  principal_investigator TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'activating', 'active', 'on_hold', 'closed')),
  target_enrollment INTEGER NOT NULL DEFAULT 0,
  current_enrollment INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site activation milestones table
CREATE TABLE site_activation_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN (
    'regulatory_submitted',
    'regulatory_approved',
    'contract_sent',
    'contract_executed',
    'siv_scheduled',
    'siv_completed',
    'edc_training_complete',
    'site_activated'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  planned_date DATE,
  actual_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, milestone_type)
);

-- Site performance metrics table
CREATE TABLE site_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  queries_opened INTEGER NOT NULL DEFAULT 0,
  queries_resolved INTEGER NOT NULL DEFAULT 0,
  avg_resolution_days DECIMAL(5,2),
  data_entry_lag_days DECIMAL(5,2),
  protocol_deviations INTEGER NOT NULL DEFAULT 0,
  visit_completion_rate DECIMAL(5,2),
  performance_score DECIMAL(5,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, period)
);

-- Indexes for common queries
CREATE INDEX idx_sites_study_id ON sites(study_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_milestones_site_id ON site_activation_milestones(site_id);
CREATE INDEX idx_milestones_status ON site_activation_milestones(status);
CREATE INDEX idx_performance_site_id ON site_performance_metrics(site_id);
CREATE INDEX idx_performance_period ON site_performance_metrics(period);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON site_activation_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create default milestones when a site is created
CREATE OR REPLACE FUNCTION create_site_milestones()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO site_activation_milestones (site_id, milestone_type, status)
  VALUES
    (NEW.id, 'regulatory_submitted', 'pending'),
    (NEW.id, 'regulatory_approved', 'pending'),
    (NEW.id, 'contract_sent', 'pending'),
    (NEW.id, 'contract_executed', 'pending'),
    (NEW.id, 'siv_scheduled', 'pending'),
    (NEW.id, 'siv_completed', 'pending'),
    (NEW.id, 'edc_training_complete', 'pending'),
    (NEW.id, 'site_activated', 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_milestones_on_site_insert
  AFTER INSERT ON sites
  FOR EACH ROW EXECUTE FUNCTION create_site_milestones();

-- Enable Row Level Security (disabled for now - no auth)
-- ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_activation_milestones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_performance_metrics ENABLE ROW LEVEL SECURITY;
