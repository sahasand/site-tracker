'use server'

import { revalidatePath } from 'next/cache'
import { updateMilestoneAndSiteStatus } from '@/lib/queries/milestones'
import type { UpdateMilestoneInput } from '@/types'

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
