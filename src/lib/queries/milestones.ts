import { createClient } from '@/lib/supabase/server'
import type { SiteActivationMilestone, UpdateMilestoneInput, SiteStatus } from '@/types'

export async function getMilestonesBySite(siteId: string): Promise<SiteActivationMilestone[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_activation_milestones')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function updateMilestone(
  id: string,
  input: UpdateMilestoneInput
): Promise<SiteActivationMilestone> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_activation_milestones')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMilestoneAndSiteStatus(
  milestoneId: string,
  siteId: string,
  milestoneInput: UpdateMilestoneInput
): Promise<SiteActivationMilestone> {
  const supabase = await createClient()

  // Update the milestone
  const { data: milestone, error: milestoneError } = await supabase
    .from('site_activation_milestones')
    .update(milestoneInput)
    .eq('id', milestoneId)
    .select()
    .single()

  if (milestoneError) throw milestoneError

  // Get all milestones for this site to determine status
  const { data: allMilestones, error: fetchError } = await supabase
    .from('site_activation_milestones')
    .select('*')
    .eq('site_id', siteId)

  if (fetchError) throw fetchError

  // Determine new site status
  const siteActivated = allMilestones.find(m => m.milestone_type === 'site_activated')
  const anyInProgress = allMilestones.some(m => m.status === 'in_progress')
  const anyCompleted = allMilestones.some(m => m.status === 'completed')

  let newStatus: SiteStatus = 'planned'
  if (siteActivated?.status === 'completed') {
    newStatus = 'active'
  } else if (anyInProgress || anyCompleted) {
    newStatus = 'activating'
  }

  // Update site status
  const { error: siteError } = await supabase
    .from('sites')
    .update({ status: newStatus })
    .eq('id', siteId)

  if (siteError) throw siteError

  return milestone
}
