'use client'

import { useState } from 'react'
import type { StageDuration } from '@/types'
import { STAGE_ORDER } from '@/types'

interface StageDurationChartProps {
  stageDurations: StageDuration[]
}

export default function StageDurationChart({ stageDurations }: StageDurationChartProps) {
  const [hoveredStage, setHoveredStage] = useState<string | null>(null)

  // Check if we have any data
  const hasData = stageDurations.some(s => s.avgDays !== null)

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-700 mb-1">No activation data yet</p>
        <p className="text-xs text-slate-500 max-w-[240px]">
          Complete milestones to see how long each stage takes on average.
        </p>
      </div>
    )
  }

  // Calculate totals and find longest stage
  const totalDays = stageDurations.reduce((sum, s) => sum + (s.avgDays || 0), 0)
  const maxDays = Math.max(...stageDurations.map(s => s.avgDays || 0))
  const longestStage = stageDurations.find(s => s.avgDays === maxDays && s.avgDays !== null)

  // Generate insight text
  const insight = generateInsight(stageDurations, totalDays, longestStage)

  return (
    <div className="space-y-5">
      {/* Insight line */}
      {insight && (
        <p className="text-sm text-slate-600">
          {insight}
        </p>
      )}

      {/* Chart */}
      <div className="space-y-4">
        {STAGE_ORDER.map((stageKey, index) => {
          const stage = stageDurations.find(s => s.stage === stageKey)
          if (!stage) return null

          const percentage = maxDays > 0 && stage.avgDays !== null
            ? (stage.avgDays / maxDays) * 100
            : 0
          const isLongest = longestStage?.stage === stage.stage && stage.avgDays !== null
          const isHovered = hoveredStage === stage.stage

          return (
            <div
              key={stage.stage}
              className="relative"
              onMouseEnter={() => setHoveredStage(stage.stage)}
              onMouseLeave={() => setHoveredStage(null)}
            >
              {/* Stage row */}
              <div className="flex items-center gap-4">
                {/* Label */}
                <div className="w-28 flex-shrink-0">
                  <p className="text-sm font-medium text-slate-700">{stage.label}</p>
                </div>

                {/* Bar container */}
                <div className="flex-1 relative">
                  {/* Track */}
                  <div className="h-7 rounded bg-slate-100" />

                  {/* Bar */}
                  {stage.avgDays !== null && (
                    <div
                      className={`absolute inset-y-0 left-0 rounded transition-all duration-200 stage-bar stage-bar-delay-${index + 1}`}
                      style={{
                        width: `${Math.max(percentage, 8)}%`,
                        backgroundColor: getStageColor(stage.stage),
                        filter: isHovered ? 'brightness(1.08)' : undefined,
                        boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.15)' : undefined,
                      }}
                    />
                  )}
                </div>

                {/* Days value */}
                <div className="w-14 flex-shrink-0 text-right">
                  {stage.avgDays !== null ? (
                    <span className="text-base font-semibold text-slate-800">
                      {stage.avgDays}d
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
              </div>

              {/* Subtext row */}
              <div className="flex items-center gap-4 mt-1">
                <div className="w-28 flex-shrink-0" />
                <div className="flex items-center gap-2 text-xs">
                  {stage.completedCount > 0 ? (
                    <>
                      <span className="text-slate-400">
                        {stage.completedCount} site{stage.completedCount !== 1 ? 's' : ''}
                      </span>
                      {isLongest && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                          Longest stage
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">No completions yet</span>
                  )}
                </div>
              </div>

              {/* Hover tooltip */}
              {isHovered && stage.avgDays !== null && stage.minDays !== null && stage.maxDays !== null && (
                <div className="absolute left-32 top-0 z-10 bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[160px]">
                  <p className="font-semibold text-slate-800 mb-2">{stage.label}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Avg:</span>
                      <span className="font-medium text-slate-800">{stage.avgDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Range:</span>
                      <span className="text-slate-600">{stage.minDays}–{stage.maxDays} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sites:</span>
                      <span className="text-slate-600">{stage.completedCount} completed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="flex items-center justify-end pt-2 border-t border-slate-100">
        <span className="text-sm text-slate-500 mr-2">Total avg:</span>
        <span className="text-lg font-semibold text-slate-800">{totalDays} days</span>
      </div>
    </div>
  )
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    regulatory: '#3b82f6',    // blue
    contracts: '#8b5cf6',     // violet
    site_initiation: '#14b8a6', // teal
    go_live: '#10b981',       // emerald
  }
  return colors[stage] || '#64748b'
}

function generateInsight(
  stages: StageDuration[],
  totalDays: number,
  longestStage: StageDuration | undefined
): string | null {
  const withData = stages.filter(s => s.avgDays !== null)

  if (withData.length === 0) return null

  if (longestStage && longestStage.avgDays !== null && totalDays > 0) {
    const percentage = Math.round((longestStage.avgDays / totalDays) * 100)
    return `${longestStage.label} is your slowest stage at ${longestStage.avgDays} days — ${percentage}% of total activation time.`
  }

  if (withData.length === 1) {
    const stage = withData[0]
    return `${stage.label} averages ${stage.avgDays} days across ${stage.completedCount} site${stage.completedCount !== 1 ? 's' : ''}.`
  }

  return `Sites activate in ${totalDays} days on average.`
}
