'use client'

import Link from 'next/link'
import type { AttentionItem } from '@/lib/queries/portfolio'

interface AttentionRailProps {
  items: AttentionItem[]
  id?: string
}

export default function AttentionRail({ items, id }: AttentionRailProps) {
  if (items.length === 0) {
    return null
  }

  // Group items by severity
  const criticalItems = items.filter(i => i.daysStuck >= 21)
  const warningItems = items.filter(i => i.daysStuck >= 14 && i.daysStuck < 21)

  return (
    <div id={id} className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50 border border-amber-100">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800">Needs Attention</h2>
            <p className="text-xs text-slate-400">
              {items.length} site{items.length !== 1 ? 's' : ''} stuck for 14+ days
            </p>
          </div>
        </div>

        {/* Severity indicators */}
        <div className="flex items-center gap-3">
          {criticalItems.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-100">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-700 number-highlight">{criticalItems.length} critical</span>
            </div>
          )}
          {warningItems.length > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-100">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-bold text-amber-700 number-highlight">{warningItems.length} warning</span>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[hsl(220,25%,96%)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[hsl(220,25%,96%)] to-transparent z-10 pointer-events-none" />

        <div className="flex gap-3 overflow-x-auto pb-2 px-1 -mx-1 scrollbar-hide">
          {items.map((item) => {
            const isCritical = item.daysStuck >= 21

            return (
              <Link
                key={`${item.studyId}-${item.siteId}`}
                href={`/sites/${item.siteId}`}
                className="flex-shrink-0 group"
              >
                <div
                  className={`
                    w-72 p-4 rounded-xl border bg-white
                    transition-all duration-200 ease-out
                    hover:-translate-y-0.5
                    ${isCritical
                      ? 'border-red-200/60 hover:border-red-300 hover:shadow-lg hover:shadow-red-100/40'
                      : 'border-amber-200/60 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/40'
                    }
                  `}
                  style={{
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top row: Study + Site */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[140px]">
                      {item.studyName}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-sm text-slate-500 font-medium">
                      Site {item.siteNumber}
                    </span>
                  </div>

                  {/* Stage badge and days */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Stuck in</span>
                      <span className={`
                        text-xs font-bold px-2 py-0.5 rounded
                        ${isCritical ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}
                      `}>
                        {item.stage}
                      </span>
                    </div>
                    <div className={`
                      flex items-center gap-1 px-2 py-1 rounded-lg
                      ${isCritical ? 'bg-red-50' : 'bg-amber-50'}
                    `}>
                      <span className={`
                        text-lg font-bold number-highlight leading-none
                        ${isCritical ? 'text-red-600' : 'text-amber-600'}
                      `}>
                        {item.daysStuck}
                      </span>
                      <span className={`
                        text-[10px] font-medium uppercase
                        ${isCritical ? 'text-red-500' : 'text-amber-500'}
                      `}>
                        days
                      </span>
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className={`
                    mt-3 flex items-center gap-2 pt-3 border-t
                    ${isCritical ? 'border-red-100' : 'border-amber-100'}
                  `}>
                    <div className={`
                      flex-1 h-1 rounded-full overflow-hidden
                      ${isCritical ? 'bg-red-100' : 'bg-amber-100'}
                    `}>
                      <div
                        className={`h-full rounded-full ${isCritical ? 'bg-red-400' : 'bg-amber-400'}`}
                        style={{ width: `${Math.min((item.daysStuck / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 ${
                        isCritical ? 'text-red-400' : 'text-amber-400'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
