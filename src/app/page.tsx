import { getStudies } from '@/lib/queries/studies'
import { createClient } from '@/lib/supabase/server'
import StudyList from '@/components/studies/study-list'
import CreateStudyDialog from '@/components/studies/create-study-dialog'

export default async function HomePage() {
  const studies = await getStudies()
  const supabase = await createClient()

  // Get site counts for each study
  const siteCounts: Record<string, number> = {}
  for (const study of studies) {
    const { count } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true })
      .eq('study_id', study.id)
    siteCounts[study.id] = count || 0
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Studies
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage clinical trials and track site activation
          </p>
        </div>
        <CreateStudyDialog />
      </div>

      <StudyList studies={studies} siteCounts={siteCounts} />
    </div>
  )
}
