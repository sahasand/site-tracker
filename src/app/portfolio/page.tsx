import { getPortfolioStudies, getPortfolioAttentionItems, getPortfolioSummary, getStudyPipelines } from '@/lib/queries/portfolio'
import SummaryHeader from '@/components/portfolio/summary-header'
import AttentionRail from '@/components/portfolio/attention-rail'
import StudyPulseGrid from '@/components/portfolio/study-pulse-grid'

export default async function PortfolioPage() {
  const [studies, attentionItems, summary, pipelines] = await Promise.all([
    getPortfolioStudies(),
    getPortfolioAttentionItems(),
    getPortfolioSummary(),
    getStudyPipelines(),
  ])

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <SummaryHeader summary={summary} pipelines={pipelines} />

      {/* Attention Rail */}
      <AttentionRail items={attentionItems} id="attention-rail" />

      {/* Study Pulse Grid */}
      <StudyPulseGrid studies={studies} />
    </div>
  )
}
