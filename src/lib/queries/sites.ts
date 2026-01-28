import { createClient } from '@/lib/supabase/server'
import type { Site, CreateSiteInput, UpdateSiteInput, SiteActivationMilestone } from '@/types'

export async function getSitesByStudy(studyId: string): Promise<Site[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('study_id', studyId)
    .order('site_number', { ascending: true })

  if (error) throw error
  return data
}

export async function getSite(id: string): Promise<Site | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getSiteWithMilestones(id: string): Promise<{
  site: Site
  milestones: SiteActivationMilestone[]
} | null> {
  const supabase = await createClient()

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (siteError) throw siteError
  if (!site) return null

  const { data: milestones, error: milestonesError } = await supabase
    .from('site_activation_milestones')
    .select('*')
    .eq('site_id', id)
    .order('created_at', { ascending: true })

  if (milestonesError) throw milestonesError

  return { site, milestones }
}

export async function createSite(input: CreateSiteInput): Promise<Site> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .insert({
      ...input,
      status: 'planned',
      current_enrollment: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSite(id: string, input: UpdateSiteInput): Promise<Site> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSite(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function bulkCreateSites(inputs: CreateSiteInput[]): Promise<Site[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .insert(
      inputs.map(input => ({
        ...input,
        status: 'planned',
        current_enrollment: 0,
      }))
    )
    .select()

  if (error) throw error
  return data
}

export async function getAllSitesWithMilestones(): Promise<Array<Site & { milestones: SiteActivationMilestone[] }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sites')
    .select(`
      *,
      milestones:site_activation_milestones(*)
    `)
    .order('site_number', { ascending: true })

  if (error) throw error
  return data
}
