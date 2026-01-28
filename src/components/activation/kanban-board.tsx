'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import KanbanColumn from './kanban-column'
import SiteCard from './site-card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { updateMilestoneAction } from '@/app/actions/milestones'
import type { Site, SiteActivationMilestone, MilestoneType } from '@/types'
import { MILESTONE_LABELS } from '@/types'

interface KanbanBoardProps {
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
  bulkMode?: boolean
  selectedSiteIds?: Set<string>
  onToggleSelection?: (siteId: string) => void
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

const stageOrder: KanbanStage[] = ['regulatory', 'contracts', 'siv', 'edc', 'activated']

export function getSiteStage(site: Site & { milestones: SiteActivationMilestone[] }): KanbanStage {
  const activatedMilestone = site.milestones.find(m => m.milestone_type === 'site_activated')
  if (activatedMilestone?.status === 'completed') {
    return 'activated'
  }

  for (const [stage, config] of Object.entries(stageConfig) as [KanbanStage, typeof stageConfig[KanbanStage]][]) {
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
  sites,
  bulkMode = false,
  selectedSiteIds = new Set(),
  onToggleSelection,
}: KanbanBoardProps) {
  const router = useRouter()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<{
    site: Site & { milestones: SiteActivationMilestone[] }
    targetStage: KanbanStage
    milestonesToComplete: SiteActivationMilestone[]
  } | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

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

  const activeSite = activeId ? sites.find(s => s.id === activeId) : null

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)

    const { active, over } = event
    if (!over) return

    const siteId = active.id as string
    const targetStage = over.id as KanbanStage

    const site = sites.find(s => s.id === siteId)
    if (!site) return

    const currentStage = getSiteStage(site)
    if (currentStage === targetStage) return

    // Only allow moving forward in stages (for now)
    const currentIndex = stageOrder.indexOf(currentStage)
    const targetIndex = stageOrder.indexOf(targetStage)
    if (targetIndex <= currentIndex) {
      toast.error('Sites can only move forward in the pipeline')
      return
    }

    // Find all milestones that need to be completed to reach target stage
    const milestonesToComplete: SiteActivationMilestone[] = []
    for (let i = currentIndex; i < targetIndex; i++) {
      const stage = stageOrder[i]
      const stageMilestones = site.milestones.filter(m =>
        stageConfig[stage].milestones.includes(m.milestone_type) &&
        m.status !== 'completed'
      )
      milestonesToComplete.push(...stageMilestones)
    }

    // Note: We only complete milestones up to (but not including) the target stage
    // This ensures the site ends up at the target stage, not beyond

    setPendingMove({ site, targetStage, milestonesToComplete })
  }

  async function handleConfirmMove() {
    if (!pendingMove) return

    setIsMoving(true)
    try {
      const today = new Date().toISOString().split('T')[0]

      // Complete all milestones in sequence
      for (const milestone of pendingMove.milestonesToComplete) {
        await updateMilestoneAction(
          milestone.id,
          pendingMove.site.id,
          pendingMove.site.study_id,
          {
            status: 'completed',
            actual_date: today,
          }
        )
      }

      toast.success(`${pendingMove.site.name} moved to ${stageConfig[pendingMove.targetStage].title}`)
      router.refresh()
    } catch {
      toast.error('Failed to move site. Please try again.')
    } finally {
      setIsMoving(false)
      setPendingMove(null)
    }
  }

  // In bulk mode, don't enable drag-drop
  if (bulkMode) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
        {(Object.entries(stageConfig) as [KanbanStage, typeof stageConfig[KanbanStage]][]).map(
          ([stage, config], index) => (
            <KanbanColumn
              key={stage}
              stageId={stage}
              title={config.title}
              subtitle={config.subtitle}
              sites={sitesByStage[stage]}
              color={config.color}
              isLast={index === Object.keys(stageConfig).length - 1}
              bulkMode={bulkMode}
              selectedSiteIds={selectedSiteIds}
              onToggleSelection={onToggleSelection}
            />
          )
        )}
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">
          {(Object.entries(stageConfig) as [KanbanStage, typeof stageConfig[KanbanStage]][]).map(
            ([stage, config], index) => (
              <KanbanColumn
                key={stage}
                stageId={stage}
                title={config.title}
                subtitle={config.subtitle}
                sites={sitesByStage[stage]}
                color={config.color}
                isLast={index === Object.keys(stageConfig).length - 1}
                bulkMode={bulkMode}
                selectedSiteIds={selectedSiteIds}
                onToggleSelection={onToggleSelection}
                isDragging={activeId !== null}
              />
            )
          )}
        </div>

        <DragOverlay>
          {activeSite && (
            <div className="opacity-90 rotate-3 scale-105">
              <SiteCard
                site={activeSite}
                stageColor={stageConfig[getSiteStage(activeSite)].color}
                isDragOverlay
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {pendingMove && (
        <ConfirmDialog
          open={true}
          onOpenChange={() => setPendingMove(null)}
          title={`Move ${pendingMove.site.name}?`}
          description={
            pendingMove.milestonesToComplete.length > 0
              ? `This will mark ${pendingMove.milestonesToComplete.length} milestone${pendingMove.milestonesToComplete.length > 1 ? 's' : ''} as completed: ${pendingMove.milestonesToComplete.map(m => MILESTONE_LABELS[m.milestone_type]).join(', ')}`
              : `Move site to ${stageConfig[pendingMove.targetStage].title}?`
          }
          confirmLabel={isMoving ? 'Moving...' : 'Move Site'}
          onConfirm={handleConfirmMove}
        />
      )}
    </>
  )
}
