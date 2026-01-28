import { createClient } from '@/lib/supabase/server'
import type { SiteActivationMilestone, MilestoneType } from '@/types'
import { MILESTONE_ORDER, MILESTONE_LABELS } from '@/types'

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
