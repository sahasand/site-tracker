'use server'

import { revalidatePath } from 'next/cache'
import { createSite, updateSite, deleteSite, bulkCreateSites } from '@/lib/queries/sites'
import type { CreateSiteInput, UpdateSiteInput } from '@/types'

export async function createSiteAction(input: CreateSiteInput) {
  const site = await createSite(input)
  revalidatePath(`/studies/${input.study_id}`)
  revalidatePath('/activation')
  return site
}

export async function updateSiteAction(id: string, studyId: string, input: UpdateSiteInput) {
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

export async function bulkCreateSitesAction(inputs: CreateSiteInput[]) {
  if (inputs.length === 0) return []

  const studyId = inputs[0].study_id
  const sites = await bulkCreateSites(inputs)
  revalidatePath(`/studies/${studyId}`)
  revalidatePath('/activation')
  return sites
}
