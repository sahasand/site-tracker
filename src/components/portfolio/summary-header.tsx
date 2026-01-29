'use client'

import Sparkline from './sparkline'
import PulseLine from './pulse-line'
import type { PortfolioSummary } from '@/lib/queries/portfolio'

interface SummaryHeaderProps {
  summary: PortfolioSummary
  onAtRiskClick?: () => void
}

export default function SummaryHeader({ summary, onAtRiskClick }: SummaryHeaderProps) {
  const {
    sitesTotal,
    sitesActive,
    sitesActivating,
    sitesAtRisk,
    weeklyVelocity,
    velocityTrend,
    velocityChange,
  } = summary

  // Calculate velocity per week
  const recentVelocity = weeklyVelocity.slice(-4)
  const avgVelocity = recentVelocity.length > 0
    ? (recentVelocity.reduce((a, b) => a + b, 0) / recentVelocity.length).toFixed(1)
    : '0'

  const trendArrow = velocityTrend === 'up' ? '↗' : velocityTrend === 'down' ? '↘' : '→'
  const trendColor = velocityTrend === 'up' ? 'text-teal-600' : velocityTrend === 'down' ? 'text-red-500' : 'text-slate-500'

  // Determine pulse intensity based on at-risk count
  const pulseIntensity = sitesAtRisk === 0 ? 'low' : sitesAtRisk <= 2 ? 'medium' : 'high'

  return (
    <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200/60 shadow-sm">
      {/* Pulse line background */}
      <PulseLine intensity={pulseIntensity} />

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

        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-6">
          {/* Sites Total */}
          <div className="text-center">
            <p className="text-4xl font-semibold text-slate-900 tracking-tight">{sitesTotal}</p>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium mt-1">sites total</p>
          </div>

          {/* Active */}
          <div className="text-center">
            <p className="text-4xl font-semibold text-teal-600 tracking-tight">{sitesActive}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">active</span>
              <svg className="w-3.5 h-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          </div>

          {/* Activating */}
          <div className="text-center">
            <p className="text-4xl font-semibold text-slate-700 tracking-tight">{sitesActivating}</p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">activating</span>
              <span className="text-slate-400">→</span>
            </div>
          </div>

          {/* At Risk */}
          <div className="text-center">
            <button
              onClick={onAtRiskClick}
              className="group"
              disabled={sitesAtRisk === 0}
            >
              <p className={`text-4xl font-semibold tracking-tight ${
                sitesAtRisk === 0 ? 'text-slate-300' : 'text-amber-500 group-hover:text-amber-600'
              }`}>
                {sitesAtRisk}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">at risk</span>
                {sitesAtRisk > 0 && (
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Velocity row */}
        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
          <Sparkline
            data={weeklyVelocity}
            width={120}
            height={28}
            color={velocityTrend === 'up' ? '#14b8a6' : velocityTrend === 'down' ? '#ef4444' : '#64748b'}
          />
          <div className="text-sm text-slate-600">
            <span className="font-medium">{avgVelocity}</span>
            <span className="text-slate-400"> sites/week</span>
            {velocityChange !== 0 && (
              <span className={`ml-2 ${trendColor}`}>
                {trendArrow} {velocityChange > 0 ? '+' : ''}{velocityChange}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
