'use server'

import { revalidatePath } from 'next/cache'
import { createSite, updateSite, deleteSite } from '@/lib/queries/sites'
import type { CreateSiteInput } from '@/types'

export async function createSiteAction(input: CreateSiteInput) {
  const site = await createSite(input)
  revalidatePath(`/studies/${input.study_id}`)
  revalidatePath('/activation')
  return site
}

export async function updateSiteAction(id: string, studyId: string, input: Partial<CreateSiteInput>) {
  const site = await updateSite(id, input)
  revalidatePath(`/studies/${studyId}`)
  revalidatePath(`/sites/${id}`)
  revalidatePath('/activation')
  return site
}

export async function deleteSiteAction(id: string, studyId: string) {
  await deleteSite(id)
  revalidatePath(`/studies/${studyId}`)
  revalidatePath('/activation')
}
