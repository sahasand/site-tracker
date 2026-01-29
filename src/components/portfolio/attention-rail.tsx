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

  return (
    <div id={id} className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <span className="text-sm font-medium text-slate-700">
          {items.length} need{items.length === 1 ? 's' : ''} attention
        </span>
      </div>

      {/* Horizontal scroll container */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {items.map((item) => (
          <Link
            key={`${item.studyId}-${item.siteId}`}
            href={`/sites/${item.siteId}`}
            className="flex-shrink-0 group"
          >
            <div className="w-64 p-4 rounded-lg bg-amber-50/50 border border-amber-200/60 hover:border-amber-300 hover:shadow-sm transition-all duration-200">
              {/* Study and Site */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-slate-700 truncate">{item.studyName}</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600">Site {item.siteNumber}</span>
              </div>

              {/* Stage and Days */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Stuck in <span className="font-medium text-amber-700">{item.stage}</span>
                </span>
                <span className="text-sm font-semibold text-red-600">{item.daysStuck}d</span>
              </div>

              {/* Arrow indicator */}
              <div className="mt-3 flex items-center text-slate-400 group-hover:text-amber-600 transition-colors">
                <div className="flex-1 h-px bg-current opacity-30" />
                <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
