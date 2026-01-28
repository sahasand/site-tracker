export type StudyPhase = 'I' | 'II' | 'III' | 'IV'
export type StudyStatus = 'active' | 'completed' | 'on_hold'

export type SiteStatus = 'planned' | 'activating' | 'active' | 'on_hold' | 'closed'

export type MilestoneType =
  | 'regulatory_submitted'
  | 'regulatory_approved'
  | 'contract_sent'
  | 'contract_executed'
  | 'siv_scheduled'
  | 'siv_completed'
  | 'edc_training_complete'
  | 'site_activated'

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed'

export interface Study {
  id: string
  name: string
  protocol_number: string
  sponsor_name: string
  phase: StudyPhase
  status: StudyStatus
  target_enrollment: number
  enrollment_start_date: string | null
  planned_end_date: string | null
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  study_id: string
  site_number: string
  name: string
  principal_investigator: string
  country: string
  region: string | null
  status: SiteStatus
  target_enrollment: number
  current_enrollment: number
  created_at: string
  updated_at: string
}

export interface SiteActivationMilestone {
  id: string
  site_id: string
  milestone_type: MilestoneType
  status: MilestoneStatus
  planned_date: string | null
  actual_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SitePerformanceMetric {
  id: string
  site_id: string
  period: string
  queries_opened: number
  queries_resolved: number
  avg_resolution_days: number | null
  data_entry_lag_days: number | null
  protocol_deviations: number
  visit_completion_rate: number | null
  performance_score: number | null
  recorded_at: string
}

// Form input types
export interface CreateStudyInput {
  name: string
  protocol_number: string
  sponsor_name: string
  phase: StudyPhase
  target_enrollment: number
  enrollment_start_date?: string
  planned_end_date?: string
}

export interface CreateSiteInput {
  study_id: string
  site_number: string
  name: string
  principal_investigator: string
  country: string
  region?: string
  target_enrollment: number
}

export interface UpdateMilestoneInput {
  status: MilestoneStatus
  planned_date?: string | null
  actual_date?: string | null
  notes?: string | null
}

// Milestone display order
export const MILESTONE_ORDER: MilestoneType[] = [
  'regulatory_submitted',
  'regulatory_approved',
  'contract_sent',
  'contract_executed',
  'siv_scheduled',
  'siv_completed',
  'edc_training_complete',
  'site_activated',
]

export const MILESTONE_LABELS: Record<MilestoneType, string> = {
  regulatory_submitted: 'Regulatory Submitted',
  regulatory_approved: 'Regulatory Approved',
  contract_sent: 'Contract Sent',
  contract_executed: 'Contract Executed',
  siv_scheduled: 'SIV Scheduled',
  siv_completed: 'SIV Completed',
  edc_training_complete: 'EDC Training Complete',
  site_activated: 'Site Activated',
}
