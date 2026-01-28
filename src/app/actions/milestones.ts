'use server'

import { revalidatePath } from 'next/cache'
import { updateMilestoneAndSiteStatus, bulkUpdateMilestones } from '@/lib/queries/milestones'
import type { UpdateMilestoneInput, MilestoneType, MilestoneStatus } from '@/types'

export async function updateMilestoneAction(
  milestoneId: string,
  siteId: string,
  studyId: string,
  input: UpdateMilestoneInput
) {
  const milestone = await updateMilestoneAndSiteStatus(milestoneId, siteId, input)
  revalidatePath(`/sites/${siteId}`)
  revalidatePath(`/studies/${studyId}`)
  revalidatePath('/activation')
  return milestone
}

export async function bulkUpdateMilestonesAction(
  siteIds: string[],
  milestoneType: MilestoneType,
  status: MilestoneStatus,
  date: string | null
) {
  await bulkUpdateMilestones(siteIds, milestoneType, status, date)
  revalidatePath('/activation')
  // Revalidate all affected site pages
  for (const siteId of siteIds) {
    revalidatePath(`/sites/${siteId}`)
  }
}
