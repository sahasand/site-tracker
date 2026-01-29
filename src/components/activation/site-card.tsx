'use client'

import { useDraggable } from '@dnd-kit/core'
import Link from 'next/link'
import type { Site, SiteActivationMilestone } from '@/types'
import { stageConfig, stageOrder } from './kanban-board'

interface SiteCardProps {
  site: Site & { milestones: SiteActivationMilestone[] }
  stageColor?: string
  bulkMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (siteId: string) => void
  isDragOverlay?: boolean
}

const accentColors: Record<string, string> = {
  blue: 'border-l-blue-500',
  violet: 'border-l-violet-500',
  teal: 'border-l-teal-500',
  amber: 'border-l-amber-500',
  emerald: 'border-l-emerald-500',
}

function SiteCardContent({
  site,
  bulkMode = false,
  isSelected = false,
}: Omit<SiteCardProps, 'onToggleSelection' | 'isDragOverlay' | 'stageColor'>) {
  const currentMilestone = site.milestones.find(m =>
    m.status === 'in_progress' ||
    (m.status === 'pending' && site.milestones.every(om =>
      om.status === 'pending' || om.milestone_type === m.milestone_type
    ))
  )

  // Count completed stages (a stage is complete when all its milestones are completed)
  const completedStages = stageOrder.filter(stage => {
    const stageMilestones = site.milestones.filter(m =>
      stageConfig[stage].milestones.includes(m.milestone_type)
    )
    return stageMilestones.length > 0 && stageMilestones.every(m => m.status === 'completed')
  }).length
  const totalStages = stageOrder.length
  const progress = totalStages > 0 ? (completedStages / totalStages) * 100 : 0

  const daysInStage = currentMilestone?.updated_at
    ? Math.floor((Date.now() - new Date(currentMilestone.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          {bulkMode && (
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-teal-500 border-teal-500'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
          <span className="font-semibold text-xs text-slate-800 tracking-tight">
            Site {site.site_number}
          </span>
        </div>
        {daysInStage > 0 && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            daysInStage > 14 ? 'bg-red-50 text-red-600 ring-1 ring-red-200' :
            daysInStage > 7 ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' :
            'bg-slate-100 text-slate-500'
          }`}>
            {daysInStage}d
          </span>
        )}
      </div>

      <p className="text-sm text-slate-700 font-medium truncate mb-0.5 group-hover:text-slate-900 transition-colors">
        {site.name}
      </p>

      <div className="flex items-center gap-1.5 mb-2">
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <p className="text-[11px] text-slate-500 truncate">{site.principal_investigator}</p>
      </div>

      <div className="milestone-progress">
        <div
          className="milestone-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-slate-400 font-medium">
          {completedStages}/{totalStages} stages
        </span>
        {progress === 100 && (
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Complete
          </span>
        )}
      </div>
    </div>
  )
}

export default function SiteCard({
  site,
  stageColor = 'teal',
  bulkMode = false,
  isSelected = false,
  onToggleSelection,
  isDragOverlay = false,
}: SiteCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: site.id,
    disabled: bulkMode,
  })

  const accentClass = accentColors[stageColor] || accentColors.teal

  // Drag overlay (shown while dragging)
  if (isDragOverlay) {
    return (
      <div className={`bg-white rounded-lg border-l-[3px] ${accentClass} shadow-lg w-[240px]`}>
        <SiteCardContent site={site} bulkMode={false} isSelected={false} />
      </div>
    )
  }

  // Bulk mode (checkbox selection)
  if (bulkMode) {
    return (
      <div
        onClick={() => onToggleSelection?.(site.id)}
        className={`bg-white rounded-lg border-l-[3px] ${accentClass} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer card-hover group ${
          isSelected ? 'ring-2 ring-teal-500 ring-offset-1' : ''
        }`}
      >
        <SiteCardContent site={site} bulkMode={bulkMode} isSelected={isSelected} />
      </div>
    )
  }

  // Normal mode with drag-and-drop
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg border-l-[3px] ${accentClass} shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing card-hover group ${
        isDragging ? 'opacity-40 ring-2 ring-dashed ring-slate-300 scale-[0.98]' : ''
      }`}
    >
      <Link href={`/sites/${site.id}`} onClick={(e) => {
        // Prevent navigation if we're dragging
        if (isDragging) {
          e.preventDefault()
        }
      }}>
        <SiteCardContent site={site} bulkMode={false} isSelected={false} />
      </Link>
    </div>
  )
}
