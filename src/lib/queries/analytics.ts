import { createClient } from '@/lib/supabase/server'
import type { SiteActivationMilestone, MilestoneType, StageType, StageDuration } from '@/types'
import { MILESTONE_ORDER, MILESTONE_LABELS, STAGE_CONFIG, STAGE_ORDER } from '@/types'

export type { StageDuration, StageType }
export { STAGE_ORDER }

export interface MilestoneCycleTime {
  type: MilestoneType
  label: string
  avgDays: number | null
  minDays: number | null
  maxDays: number | null
  completedCount: number
}

export async function getMilestonesByStudy(studyId: string): Promise<SiteActivationMilestone[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_activation_milestones')
    .select(`
      *,
      site:sites!inner(study_id)
    `)
    .eq('site.study_id', studyId)

  if (error) throw error
  return data
}

export async function calculateCycleTimes(studyId: string): Promise<MilestoneCycleTime[]> {
  const milestones = await getMilestonesByStudy(studyId)

  // Group milestones by type
  const byType = new Map<MilestoneType, SiteActivationMilestone[]>()
  for (const m of milestones) {
    const list = byType.get(m.milestone_type) || []
    list.push(m)
    byType.set(m.milestone_type, list)
  }

  // Calculate cycle times for each milestone type
  return MILESTONE_ORDER.map((type) => {
    const typeMilestones = byType.get(type) || []
    const completed = typeMilestones.filter(m =>
      m.status === 'completed' && m.actual_date && m.planned_date
    )

    if (completed.length === 0) {
      return {
        type,
        label: MILESTONE_LABELS[type],
        avgDays: null,
        minDays: null,
        maxDays: null,
        completedCount: 0,
      }
    }

    // Calculate days difference for each completed milestone
    const daysArray = completed.map(m => {
      const planned = new Date(m.planned_date!)
      const actual = new Date(m.actual_date!)
      return Math.round((actual.getTime() - planned.getTime()) / (1000 * 60 * 60 * 24))
    })

    const avgDays = Math.round(daysArray.reduce((a, b) => a + b, 0) / daysArray.length)
    const minDays = Math.min(...daysArray)
    const maxDays = Math.max(...daysArray)

    return {
      type,
      label: MILESTONE_LABELS[type],
      avgDays,
      minDays,
      maxDays,
      completedCount: completed.length,
    }
  })
}

// Get sites stuck in a stage for more than X days for a specific study
export async function getStuckSitesForStudy(studyId: string, daysThreshold: number = 14): Promise<Array<{
  siteId: string
  siteName: string
  siteNumber: string
  milestoneType: MilestoneType
  milestoneLabel: string
  daysStuck: number
}>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_activation_milestones')
    .select(`
      *,
      site:sites!inner(
        id,
        name,
        site_number,
        study_id,
        status
      )
    `)
    .eq('status', 'in_progress')
    .eq('site.study_id', studyId)

  if (error) throw error

  const now = new Date()
  const results: Array<{
    siteId: string
    siteName: string
    siteNumber: string
    milestoneType: MilestoneType
    milestoneLabel: string
    daysStuck: number
  }> = []

  for (const milestone of data) {
    if (!milestone.site || milestone.site.status === 'closed') continue

    const updatedAt = new Date(milestone.updated_at)
    const daysStuck = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

    if (daysStuck >= daysThreshold) {
      results.push({
        siteId: milestone.site.id,
        siteName: milestone.site.name,
        siteNumber: milestone.site.site_number,
        milestoneType: milestone.milestone_type,
        milestoneLabel: MILESTONE_LABELS[milestone.milestone_type as MilestoneType],
        daysStuck,
      })
    }
  }

  return results.sort((a, b) => b.daysStuck - a.daysStuck)
}

// Get sites stuck in a stage for more than X days
export async function getStuckSites(daysThreshold: number = 14): Promise<Array<{
  siteId: string
  siteName: string
  siteNumber: string
  studyId: string
  studyName: string
  milestoneType: MilestoneType
  milestoneLabel: string
  daysStuck: number
}>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_activation_milestones')
    .select(`
      *,
      site:sites(
        id,
        name,
        site_number,
        study_id,
        status,
        study:studies(name)
      )
    `)
    .eq('status', 'in_progress')

  if (error) throw error

  const now = new Date()
  const results: Array<{
    siteId: string
    siteName: string
    siteNumber: string
    studyId: string
    studyName: string
    milestoneType: MilestoneType
    milestoneLabel: string
    daysStuck: number
  }> = []

  for (const milestone of data) {
    if (!milestone.site || milestone.site.status === 'closed') continue

    const updatedAt = new Date(milestone.updated_at)
    const daysStuck = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

    if (daysStuck >= daysThreshold) {
      results.push({
        siteId: milestone.site.id,
        siteName: milestone.site.name,
        siteNumber: milestone.site.site_number,
        studyId: milestone.site.study_id,
        studyName: milestone.site.study?.name || 'Unknown',
        milestoneType: milestone.milestone_type,
        milestoneLabel: MILESTONE_LABELS[milestone.milestone_type as MilestoneType],
        daysStuck,
      })
    }
  }

  // Sort by days stuck descending
  return results.sort((a, b) => b.daysStuck - a.daysStuck)
}

// Calculate average duration per activation stage
export async function calculateStageDurations(studyId: string): Promise<StageDuration[]> {
  const supabase = await createClient()

  // Get all sites with their milestones and creation date
  const { data: sites, error } = await supabase
    .from('sites')
    .select(`
      id,
      created_at,
      milestones:site_activation_milestones(
        milestone_type,
        status,
        actual_date
      )
    `)
    .eq('study_id', studyId)

  if (error) throw error

  // For each stage, collect durations from all sites
  const stageDurations: Record<StageType, number[]> = {
    regulatory: [],
    contracts: [],
    site_initiation: [],
    go_live: [],
  }

  for (const site of sites) {
    const milestoneMap = new Map<MilestoneType, string | null>()
    for (const m of site.milestones) {
      if (m.status === 'completed' && m.actual_date) {
        milestoneMap.set(m.milestone_type as MilestoneType, m.actual_date)
      }
    }

    // Regulatory: site creation → regulatory_approved
    const regApproved = milestoneMap.get('regulatory_approved')
    if (regApproved) {
      const days = daysBetween(site.created_at, regApproved)
      if (days >= 0) stageDurations.regulatory.push(days)
    }

    // Contracts: regulatory_approved → contract_executed
    const contractExecuted = milestoneMap.get('contract_executed')
    if (regApproved && contractExecuted) {
      const days = daysBetween(regApproved, contractExecuted)
      if (days >= 0) stageDurations.contracts.push(days)
    }

    // Site Initiation: contract_executed → siv_completed
    const sivCompleted = milestoneMap.get('siv_completed')
    if (contractExecuted && sivCompleted) {
      const days = daysBetween(contractExecuted, sivCompleted)
      if (days >= 0) stageDurations.site_initiation.push(days)
    }

    // Go-Live: siv_completed → site_activated
    const siteActivated = milestoneMap.get('site_activated')
    if (sivCompleted && siteActivated) {
      const days = daysBetween(sivCompleted, siteActivated)
      if (days >= 0) stageDurations.go_live.push(days)
    }
  }

  // Calculate stats for each stage
  return STAGE_ORDER.map((stage) => {
    const durations = stageDurations[stage]
    const config = STAGE_CONFIG[stage]

    if (durations.length === 0) {
      return {
        stage,
        label: config.label,
        color: config.color,
        avgDays: null,
        minDays: null,
        maxDays: null,
        completedCount: 0,
      }
    }

    const avgDays = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    const minDays = Math.min(...durations)
    const maxDays = Math.max(...durations)

    return {
      stage,
      label: config.label,
      color: config.color,
      avgDays,
      minDays,
      maxDays,
      completedCount: durations.length,
    }
  })
}

function daysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}
