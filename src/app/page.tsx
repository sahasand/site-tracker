import { getStudies } from '@/lib/queries/studies'
import { createClient } from '@/lib/supabase/server'
import StudyCard from '@/components/studies/study-card'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Studies</h1>
        <CreateStudyDialog />
      </div>

      {studies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No studies yet. Create your first study to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              siteCount={siteCounts[study.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
