'use client'

import PipelineTrack from './pipeline-track'
import type { PortfolioSummary, StudyPipeline } from '@/lib/queries/portfolio'

interface SummaryHeaderProps {
  summary?: PortfolioSummary
  pipelines?: StudyPipeline[]
}

export default function SummaryHeader({ pipelines = [] }: SummaryHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/60 shadow-sm">
      <div className="relative px-6 py-6">
        {/* Title row */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
            Portfolio
          </h1>
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Pipeline Track - Sites by Study */}
        <PipelineTrack pipelines={pipelines} />
      </div>
    </div>
  )
}
