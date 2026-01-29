import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStudy } from '@/lib/queries/studies'
import { getSitesByStudy } from '@/lib/queries/sites'
import { calculateCycleTimes, calculateStageDurations, getStuckSitesForStudy } from '@/lib/queries/analytics'
import SiteTableWithFilter from '@/components/sites/site-table-with-filter'
import CreateSiteDialog from '@/components/sites/create-site-dialog'
import ImportCSVDialog from '@/components/sites/import-csv-dialog'
import EditStudyDialog from '@/components/studies/edit-study-dialog'
import StudyPulse from '@/components/studies/study-pulse'
import StageDurationChart from '@/components/studies/stage-duration-chart'

interface StudyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudyDetailPage({ params }: StudyDetailPageProps) {
  const { id } = await params
  const study = await getStudy(id)

  if (!study) {
    notFound()
  }

  const [sites, cycleTimes, stageDurations, stuckSites] = await Promise.all([
    getSitesByStudy(id),
    calculateCycleTimes(id),
    calculateStageDurations(id),
    getStuckSitesForStudy(id),
  ])

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Studies
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {study.name}
            </h1>
            <span className={`phase-badge phase-badge-${study.phase}`}>
              Phase {study.phase}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <span className="font-medium">{study.protocol_number}</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
              <span>{study.sponsor_name}</span>
            </div>
          </div>
        </div>
        <EditStudyDialog study={study} siteCount={sites.length} />
      </div>

      {/* Study Pulse */}
      <StudyPulse sites={sites} cycleTimes={cycleTimes} stuckSites={stuckSites} />

      {/* Stage Duration Chart */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">Stage Duration</h2>
              <p className="text-xs text-slate-500 mt-0.5">Average days per activation stage</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <StageDurationChart stageDurations={stageDurations} />
        </div>
      </div>

      {/* Sites Section */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Sites</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage sites for this study</p>
          </div>
          <div className="flex items-center gap-2">
            <ImportCSVDialog studyId={id} existingSiteNumbers={sites.map(s => s.site_number)} />
            <CreateSiteDialog studyId={id} />
          </div>
        </div>
        <div className="p-5">
          {sites.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">No sites yet</h3>
              <p className="text-slate-500 text-sm mb-4">Add your first site to start tracking activation.</p>
              <div className="flex items-center justify-center gap-2">
                <ImportCSVDialog studyId={id} existingSiteNumbers={[]} />
                <CreateSiteDialog studyId={id} />
              </div>
            </div>
          ) : (
            <SiteTableWithFilter sites={sites} studyName={study.protocol_number} />
          )}
        </div>
      </div>
    </div>
  )
}
