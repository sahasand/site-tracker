'use client'

import KanbanColumn from './kanban-column'
import type { Site, SiteActivationMilestone, MilestoneType } from '@/types'

interface KanbanBoardProps {
  studyId: string
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
  bulkMode?: boolean
  selectedSiteIds?: Set<string>
  onToggleSelection?: (siteId: string) => void
  isDragging?: boolean
  overStage?: KanbanStage | null
}

export type KanbanStage = 'regulatory' | 'contracts' | 'siv' | 'edc' | 'activated'

export const stageConfig: Record<KanbanStage, { title: string; subtitle: string; milestones: MilestoneType[]; color: string }> = {
  regulatory: {
    title: 'Regulatory',
    subtitle: 'IRB/EC Review',
    milestones: ['regulatory_submitted', 'regulatory_approved'],
    color: 'blue',
  },
  contracts: {
    title: 'Contracts',
    subtitle: 'CTA & Budget',
    milestones: ['contract_sent', 'contract_executed'],
    color: 'violet',
  },
  siv: {
    title: 'SIV',
    subtitle: 'Site Initiation',
    milestones: ['siv_scheduled', 'siv_completed'],
    color: 'teal',
  },
  edc: {
    title: 'EDC',
    subtitle: 'Training',
    milestones: ['edc_training_complete'],
    color: 'amber',
  },
  activated: {
    title: 'Activated',
    subtitle: 'Enrolling',
    milestones: ['site_activated'],
    color: 'emerald',
  },
}

export const stageOrder: KanbanStage[] = ['regulatory', 'contracts', 'siv', 'edc', 'activated']

export function getSiteStage(site: Site & { milestones: SiteActivationMilestone[] }): KanbanStage {
  const activatedMilestone = site.milestones.find(m => m.milestone_type === 'site_activated')
  if (activatedMilestone?.status === 'completed') {
    return 'activated'
  }

  // Iterate in stage order to find first stage with incomplete milestones
  for (const stage of stageOrder) {
    const config = stageConfig[stage]
    const stageMilestones = site.milestones.filter(m =>
      config.milestones.includes(m.milestone_type)
    )
    const hasIncomplete = stageMilestones.some(m => m.status !== 'completed')
    if (hasIncomplete) {
      return stage
    }
  }

  return 'regulatory'
}

export default function KanbanBoard({
  studyId,
  sites,
  bulkMode = false,
  selectedSiteIds = new Set(),
  onToggleSelection,
  isDragging = false,
  overStage = null,
}: KanbanBoardProps) {
  // Helper to create droppable IDs in format "studyId:stage"
  const getDroppableId = (stage: KanbanStage) => `${studyId}:${stage}`

  // Group sites by stage
  const sitesByStage: Record<KanbanStage, typeof sites> = {
    regulatory: [],
    contracts: [],
    siv: [],
    edc: [],
    activated: [],
  }

  for (const site of sites) {
    const stage = getSiteStage(site)
    sitesByStage[stage].push(site)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
      {(Object.entries(stageConfig) as [KanbanStage, typeof stageConfig[KanbanStage]][]).map(
        ([stage, config], index) => (
          <KanbanColumn
            key={stage}
            droppableId={getDroppableId(stage)}
            title={config.title}
            subtitle={config.subtitle}
            sites={sitesByStage[stage]}
            color={config.color}
            isLast={index === Object.keys(stageConfig).length - 1}
            bulkMode={bulkMode}
            selectedSiteIds={selectedSiteIds}
            onToggleSelection={onToggleSelection}
            isDragging={isDragging}
            isOverColumn={overStage === stage}
          />
        )
      )}
    </div>
  )
}
