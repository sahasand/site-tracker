'use client'

import { useDroppable } from '@dnd-kit/core'
import SiteCard from './site-card'
import type { Site, SiteActivationMilestone } from '@/types'

interface KanbanColumnProps {
  droppableId: string
  title: string
  subtitle: string
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
  color: string
  isLast?: boolean
  bulkMode?: boolean
  selectedSiteIds?: Set<string>
  onToggleSelection?: (siteId: string) => void
  isDragging?: boolean
  isOverColumn?: boolean
}

const colorClasses: Record<string, { dot: string; header: string; count: string; dropzone: string }> = {
  blue: {
    dot: 'bg-blue-500',
    header: 'text-blue-900',
    count: 'bg-blue-100 text-blue-700',
    dropzone: 'border-blue-300 bg-blue-50/50',
  },
  violet: {
    dot: 'bg-violet-500',
    header: 'text-violet-900',
    count: 'bg-violet-100 text-violet-700',
    dropzone: 'border-violet-300 bg-violet-50/50',
  },
  teal: {
    dot: 'bg-teal-500',
    header: 'text-teal-900',
    count: 'bg-teal-100 text-teal-700',
    dropzone: 'border-teal-300 bg-teal-50/50',
  },
  amber: {
    dot: 'bg-amber-500',
    header: 'text-amber-900',
    count: 'bg-amber-100 text-amber-700',
    dropzone: 'border-amber-300 bg-amber-50/50',
  },
  emerald: {
    dot: 'bg-emerald-500',
    header: 'text-emerald-900',
    count: 'bg-emerald-100 text-emerald-700',
    dropzone: 'border-emerald-300 bg-emerald-50/50',
  },
}

export default function KanbanColumn({
  droppableId,
  title,
  subtitle,
  sites,
  color,
  isLast,
  bulkMode = false,
  selectedSiteIds = new Set(),
  onToggleSelection,
  isDragging = false,
  isOverColumn = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  })

  const colors = colorClasses[color] || colorClasses.blue
  const showDropIndicator = isDragging && (isOver || isOverColumn)

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column flex flex-col transition-all duration-200 ${
        showDropIndicator ? `border-2 border-dashed ${colors.dropzone} rounded-lg scale-[1.02]` : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} shadow-sm`} />
          <div>
            <h3 className={`font-semibold text-sm ${colors.header}`}>{title}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.count}`}>
          {sites.length}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
        {sites.map((site, index) => (
          <div
            key={site.id}
            className="animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <SiteCard
              site={site}
              stageColor={color}
              bulkMode={bulkMode}
              isSelected={selectedSiteIds.has(site.id)}
              onToggleSelection={onToggleSelection}
            />
          </div>
        ))}
        {sites.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-8 px-4 transition-all duration-200 ${
            showDropIndicator ? 'border-2 border-dashed rounded-lg ' + colors.dropzone : ''
          }`}>
            <div className={`w-8 h-8 rounded-full ${colors.count} flex items-center justify-center mb-2 transition-transform ${
              showDropIndicator ? 'scale-110' : ''
            }`}>
              {isLast ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : showDropIndicator ? (
                <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            <p className={`text-xs text-center transition-colors ${showDropIndicator ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              {showDropIndicator ? 'Drop here' : isLast ? 'Ready for sites' : 'No sites yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
