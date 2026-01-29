import { getPortfolioStudies, getPortfolioAttentionItems, getPortfolioSummary } from '@/lib/queries/portfolio'
import SummaryHeader from '@/components/portfolio/summary-header'
import AttentionRail from '@/components/portfolio/attention-rail'
import StudyPulseGrid from '@/components/portfolio/study-pulse-grid'

export default async function PortfolioPage() {
  const [studies, attentionItems, summary] = await Promise.all([
    getPortfolioStudies(),
    getPortfolioAttentionItems(),
    getPortfolioSummary(),
  ])

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <SummaryHeader summary={summary} />

      {/* Attention Rail */}
      <AttentionRail items={attentionItems} id="attention-rail" />

      {/* Study Pulse Grid */}
      <StudyPulseGrid studies={studies} />
    </div>
  )
}
