import { createClient } from '@/lib/supabase/server'
import type { MilestoneType } from '@/types'
import { MILESTONE_LABELS } from '@/types'

// Portfolio types
export type HealthStatus = 'healthy' | 'at_risk' | 'critical'
export type TrendDirection = 'up' | 'flat' | 'down'

export interface PortfolioStudy {
  id: string
  name: string
  phase: string
  sitesActive: number
  sitesActivating: number
  sitesPlanned: number
  sitesTotal: number
  sitesStuck: number
  weeklyVelocity: number[]
  trend: TrendDirection
  health: HealthStatus
  stageCounts: {
    stage: 'regulatory' | 'contracts' | 'site_initiation' | 'go_live'
    completed: number
    inProgress: number
    total: number
  }[]
}

export interface AttentionItem {
  studyId: string
  studyName: string
  siteId: string
  siteName: string
  siteNumber: string
  stage: string
  daysStuck: number
}

export interface PortfolioSummary {
  sitesTotal: number
  sitesActive: number
  sitesActivating: number
  sitesAtRisk: number
  weeklyVelocity: number[]
  velocityTrend: TrendDirection
  velocityChange: number
}

// Calculate trend from velocity array
function calculateTrend(velocity: number[]): TrendDirection {
  if (velocity.length < 2) return 'flat'
  const recent = velocity.slice(-4)
  const earlier = velocity.slice(-8, -4)

  if (earlier.length === 0) return 'flat'

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length

  const change = earlierAvg > 0 ? (recentAvg - earlierAvg) / earlierAvg : 0

  if (change > 0.1) return 'up'
  if (change < -0.1) return 'down'
  return 'flat'
}

// Calculate health based on stuck sites and velocity
function calculateHealth(stuckCount: number, trend: TrendDirection): HealthStatus {
  if (stuckCount >= 3 || (stuckCount >= 1 && trend === 'down')) return 'critical'
  if (stuckCount >= 1 || trend === 'down') return 'at_risk'
  return 'healthy'
}

// Get weekly activation counts for a study (last N weeks)
async function getStudyWeeklyVelocity(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studyId: string,
  weeks: number = 8
): Promise<number[]> {
  const now = new Date()
  const velocity: number[] = []

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() - (i * 7))
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 7)

    const { count } = await supabase
      .from('site_activation_milestones')
      .select('*, site:sites!inner(study_id)', { count: 'exact', head: true })
      .eq('milestone_type', 'site_activated')
      .eq('status', 'completed')
      .eq('site.study_id', studyId)
      .gte('actual_date', weekStart.toISOString().split('T')[0])
      .lt('actual_date', weekEnd.toISOString().split('T')[0])

    velocity.push(count || 0)
  }

  return velocity
}

// Get stage completion counts for a study
async function getStudyStageCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studyId: string,
  totalSites: number
): Promise<PortfolioStudy['stageCounts']> {
  const stages = [
    { stage: 'regulatory' as const, milestone: 'regulatory_approved' },
    { stage: 'contracts' as const, milestone: 'contract_executed' },
    { stage: 'site_initiation' as const, milestone: 'siv_completed' },
    { stage: 'go_live' as const, milestone: 'site_activated' },
  ]

  const counts: PortfolioStudy['stageCounts'] = []

  for (const { stage, milestone } of stages) {
    const { count: completedCount } = await supabase
      .from('site_activation_milestones')
      .select('*, site:sites!inner(study_id)', { count: 'exact', head: true })
      .eq('milestone_type', milestone)
      .eq('status', 'completed')
      .eq('site.study_id', studyId)

    const { count: inProgressCount } = await supabase
      .from('site_activation_milestones')
      .select('*, site:sites!inner(study_id)', { count: 'exact', head: true })
      .eq('milestone_type', milestone)
      .eq('status', 'in_progress')
      .eq('site.study_id', studyId)

    counts.push({
      stage,
      completed: completedCount || 0,
      inProgress: inProgressCount || 0,
      total: totalSites,
    })
  }

  return counts
}

// Get stuck sites count for a study
async function getStudyStuckCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studyId: string,
  daysThreshold: number = 14
): Promise<number> {
  const { data } = await supabase
    .from('site_activation_milestones')
    .select('updated_at, site:sites!inner(study_id, status)')
    .eq('status', 'in_progress')
    .eq('site.study_id', studyId)
    .neq('site.status', 'closed')

  if (!data) return 0

  const now = new Date()
  let stuckCount = 0

  for (const milestone of data) {
    const updatedAt = new Date(milestone.updated_at)
    const daysStuck = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))
    if (daysStuck >= daysThreshold) stuckCount++
  }

  return stuckCount
}

// Main query: Get all studies with portfolio metrics
export async function getPortfolioStudies(): Promise<PortfolioStudy[]> {
  const supabase = await createClient()

  // Get all studies with site counts
  const { data: studies, error } = await supabase
    .from('studies')
    .select(`
      id,
      name,
      phase,
      sites(id, status)
    `)
    .eq('status', 'active')
    .order('name')

  if (error) throw error

  const portfolioStudies: PortfolioStudy[] = []

  for (const study of studies) {
    const sites = study.sites || []
    const sitesTotal = sites.length
    const sitesActive = sites.filter((s: { status: string }) => s.status === 'active').length
    const sitesActivating = sites.filter((s: { status: string }) => s.status === 'activating').length
    const sitesPlanned = sites.filter((s: { status: string }) => s.status === 'planned').length

    if (sitesTotal === 0) continue // Skip studies with no sites

    const weeklyVelocity = await getStudyWeeklyVelocity(supabase, study.id)
    const trend = calculateTrend(weeklyVelocity)
    const sitesStuck = await getStudyStuckCount(supabase, study.id)
    const health = calculateHealth(sitesStuck, trend)
    const stageCounts = await getStudyStageCounts(supabase, study.id, sitesTotal)

    portfolioStudies.push({
      id: study.id,
      name: study.name,
      phase: study.phase,
      sitesActive,
      sitesActivating,
      sitesPlanned,
      sitesTotal,
      sitesStuck,
      weeklyVelocity,
      trend,
      health,
      stageCounts,
    })
  }

  // Sort by health (critical first, then at_risk, then healthy)
  const healthOrder = { critical: 0, at_risk: 1, healthy: 2 }
  return portfolioStudies.sort((a, b) => healthOrder[a.health] - healthOrder[b.health])
}

// Get attention items across all studies
export async function getPortfolioAttentionItems(daysThreshold: number = 14): Promise<AttentionItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_activation_milestones')
    .select(`
      milestone_type,
      updated_at,
      site:sites!inner(
        id,
        name,
        site_number,
        status,
        study:studies!inner(id, name)
      )
    `)
    .eq('status', 'in_progress')
    .neq('site.status', 'closed')

  if (error) throw error

  const now = new Date()
  const items: AttentionItem[] = []

  for (const milestone of data) {
    const site = milestone.site as unknown as { id: string; name: string; site_number: string; status: string; study: { id: string; name: string } }
    if (!site || !site.study) continue

    const updatedAt = new Date(milestone.updated_at)
    const daysStuck = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

    if (daysStuck >= daysThreshold) {
      items.push({
        studyId: site.study.id,
        studyName: site.study.name,
        siteId: site.id,
        siteName: site.name,
        siteNumber: site.site_number,
        stage: MILESTONE_LABELS[milestone.milestone_type as MilestoneType],
        daysStuck,
      })
    }
  }

  return items.sort((a, b) => b.daysStuck - a.daysStuck)
}

// Site pipeline types
export interface PipelineSite {
  id: string
  name: string
  siteNumber: string
  currentStage: 'regulatory' | 'contracts' | 'siv' | 'active'
  stageProgress: number // 0-100 within the stage
  isStuck: boolean
  daysInStage: number
}

export interface StudyPipeline {
  id: string
  name: string
  phase: string
  sites: PipelineSite[]
}

// Determine site's current stage based on milestones
function determineSiteStage(milestones: { milestone_type: string; status: string; updated_at: string }[]): {
  stage: PipelineSite['currentStage']
  progress: number
  daysInStage: number
} {
  const stageMap: Record<string, { stage: PipelineSite['currentStage']; order: number }> = {
    regulatory_submitted: { stage: 'regulatory', order: 1 },
    regulatory_approved: { stage: 'regulatory', order: 2 },
    contract_sent: { stage: 'contracts', order: 3 },
    contract_executed: { stage: 'contracts', order: 4 },
    siv_scheduled: { stage: 'siv', order: 5 },
    siv_completed: { stage: 'siv', order: 6 },
    edc_training_complete: { stage: 'siv', order: 7 },
    site_activated: { stage: 'active', order: 8 },
  }

  // Find the highest completed milestone
  let highestCompleted = 0
  let currentInProgress: { order: number; updated_at: string } | null = null

  for (const m of milestones) {
    const info = stageMap[m.milestone_type]
    if (!info) continue

    if (m.status === 'completed' && info.order > highestCompleted) {
      highestCompleted = info.order
    }
    if (m.status === 'in_progress' && (!currentInProgress || info.order < currentInProgress.order)) {
      currentInProgress = { order: info.order, updated_at: m.updated_at }
    }
  }

  // Determine current stage
  let stage: PipelineSite['currentStage'] = 'regulatory'
  let progress = 0

  if (highestCompleted >= 8) {
    stage = 'active'
    progress = 100
  } else if (highestCompleted >= 5) {
    stage = 'siv'
    progress = highestCompleted === 7 ? 66 : highestCompleted === 6 ? 33 : 0
  } else if (highestCompleted >= 3) {
    stage = 'contracts'
    progress = highestCompleted === 4 ? 50 : 0
  } else if (highestCompleted >= 1) {
    stage = 'regulatory'
    progress = highestCompleted === 2 ? 50 : 0
  }

  // Calculate days in current stage
  const now = new Date()
  let daysInStage = 0
  if (currentInProgress) {
    const updatedAt = new Date(currentInProgress.updated_at)
    daysInStage = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))
  }

  return { stage, progress, daysInStage }
}

// Get all studies with individual site pipeline positions
export async function getStudyPipelines(): Promise<StudyPipeline[]> {
  const supabase = await createClient()

  const { data: studies, error } = await supabase
    .from('studies')
    .select(`
      id,
      name,
      phase,
      sites(
        id,
        name,
        site_number,
        status,
        site_activation_milestones(
          milestone_type,
          status,
          updated_at
        )
      )
    `)
    .eq('status', 'active')
    .order('name')

  if (error) throw error

  const pipelines: StudyPipeline[] = []

  for (const study of studies) {
    const sites = study.sites || []
    if (sites.length === 0) continue

    const pipelineSites: PipelineSite[] = []

    for (const site of sites) {
      const milestones = (site.site_activation_milestones || []) as { milestone_type: string; status: string; updated_at: string }[]
      const { stage, progress, daysInStage } = determineSiteStage(milestones)

      pipelineSites.push({
        id: site.id,
        name: site.name,
        siteNumber: site.site_number,
        currentStage: stage,
        stageProgress: progress,
        isStuck: daysInStage >= 14,
        daysInStage,
      })
    }

    pipelines.push({
      id: study.id,
      name: study.name,
      phase: study.phase,
      sites: pipelineSites,
    })
  }

  return pipelines
}

// Get aggregate portfolio summary
export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const supabase = await createClient()

  // Get all sites
  const { data: sites } = await supabase
    .from('sites')
    .select('status, study:studies!inner(status)')
    .eq('study.status', 'active')

  const allSites = sites || []
  const sitesTotal = allSites.length
  const sitesActive = allSites.filter(s => s.status === 'active').length
  const sitesActivating = allSites.filter(s => s.status === 'activating').length

  // Get stuck sites count
  const attentionItems = await getPortfolioAttentionItems()
  const sitesAtRisk = attentionItems.length

  // Calculate portfolio-wide weekly velocity (last 12 weeks)
  const now = new Date()
  const weeklyVelocity: number[] = []

  for (let i = 11; i >= 0; i--) {
    const weekEnd = new Date(now)
    weekEnd.setDate(weekEnd.getDate() - (i * 7))
    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekStart.getDate() - 7)

    const { count } = await supabase
      .from('site_activation_milestones')
      .select('*', { count: 'exact', head: true })
      .eq('milestone_type', 'site_activated')
      .eq('status', 'completed')
      .gte('actual_date', weekStart.toISOString().split('T')[0])
      .lt('actual_date', weekEnd.toISOString().split('T')[0])

    weeklyVelocity.push(count || 0)
  }

  const velocityTrend = calculateTrend(weeklyVelocity)

  // Calculate velocity change percentage
  const recentVelocity = weeklyVelocity.slice(-4).reduce((a, b) => a + b, 0) / 4
  const earlierVelocity = weeklyVelocity.slice(-8, -4).reduce((a, b) => a + b, 0) / 4
  const velocityChange = earlierVelocity > 0
    ? Math.round(((recentVelocity - earlierVelocity) / earlierVelocity) * 100)
    : 0

  return {
    sitesTotal,
    sitesActive,
    sitesActivating,
    sitesAtRisk,
    weeklyVelocity,
    velocityTrend,
    velocityChange,
  }
}
