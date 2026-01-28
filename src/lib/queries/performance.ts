import { createClient } from '@/lib/supabase/server'
import type { SitePerformanceMetric, Site, Study } from '@/types'

export interface SitePerformanceWithDetails extends SitePerformanceMetric {
  site: Site & { study: Study }
}

export async function getPerformanceMetrics(): Promise<SitePerformanceWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_performance_metrics')
    .select(`
      *,
      site:sites(
        *,
        study:studies(*)
      )
    `)
    .order('performance_score', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data as SitePerformanceWithDetails[]
}

export async function getPerformanceMetricsBySite(siteId: string): Promise<SitePerformanceMetric[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_performance_metrics')
    .select('*')
    .eq('site_id', siteId)
    .order('period', { ascending: false })

  if (error) throw error
  return data
}

export async function getPerformanceMetricsByStudy(studyId: string): Promise<SitePerformanceWithDetails[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_performance_metrics')
    .select(`
      *,
      site:sites!inner(
        *,
        study:studies!inner(*)
      )
    `)
    .eq('site.study_id', studyId)
    .order('performance_score', { ascending: false, nullsFirst: false })

  if (error) throw error
  return data as SitePerformanceWithDetails[]
}

export function getPerformanceTier(score: number | null): 'high' | 'medium' | 'low' | 'unknown' {
  if (score === null) return 'unknown'
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}
