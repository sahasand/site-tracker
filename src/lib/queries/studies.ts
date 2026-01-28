import { createClient } from '@/lib/supabase/server'
import type { Study, CreateStudyInput } from '@/types'

export async function getStudies(): Promise<Study[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getStudy(id: string): Promise<Study | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createStudy(input: CreateStudyInput): Promise<Study> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .insert({
      ...input,
      status: 'active',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStudy(id: string, input: Partial<CreateStudyInput>): Promise<Study> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStudy(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('studies')
    .delete()
    .eq('id', id)

  if (error) throw error
}
