'use server'

import { revalidatePath } from 'next/cache'
import { createStudy, updateStudy, deleteStudy } from '@/lib/queries/studies'
import type { CreateStudyInput } from '@/types'

export async function createStudyAction(input: CreateStudyInput) {
  const study = await createStudy(input)
  revalidatePath('/')
  return study
}

export async function updateStudyAction(id: string, input: Partial<CreateStudyInput>) {
  const study = await updateStudy(id, input)
  revalidatePath('/')
  revalidatePath(`/studies/${id}`)
  return study
}

export async function deleteStudyAction(id: string) {
  await deleteStudy(id)
  revalidatePath('/')
}
