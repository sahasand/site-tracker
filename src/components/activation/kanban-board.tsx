import KanbanColumn from './kanban-column'
import type { Site, SiteActivationMilestone, MilestoneType } from '@/types'

interface KanbanBoardProps {
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
}

type KanbanStage = 'regulatory' | 'contracts' | 'siv' | 'edc' | 'activated'

const stageConfig: Record<KanbanStage, { title: string; milestones: MilestoneType[] }> = {
  regulatory: {
    title: 'Regulatory',
    milestones: ['regulatory_submitted', 'regulatory_approved'],
  },
  contracts: {
    title: 'Contracts',
    milestones: ['contract_sent', 'contract_executed'],
  },
  siv: {
    title: 'SIV',
    milestones: ['siv_scheduled', 'siv_completed'],
  },
  edc: {
    title: 'EDC Training',
    milestones: ['edc_training_complete'],
  },
  activated: {
    title: 'Activated',
    milestones: ['site_activated'],
  },
}

function getSiteStage(site: Site & { milestones: SiteActivationMilestone[] }): KanbanStage {
  // If site is activated, show in activated column
  const activatedMilestone = site.milestones.find(m => m.milestone_type === 'site_activated')
  if (activatedMilestone?.status === 'completed') {
    return 'activated'
  }

  // Find the current stage based on incomplete milestones
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

export default function KanbanBoard({ sites }: KanbanBoardProps) {
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {(Object.entries(stageConfig) as [KanbanStage, typeof stageConfig[KanbanStage]][]).map(
        ([stage, config]) => (
          <KanbanColumn
            key={stage}
            title={config.title}
            sites={sitesByStage[stage]}
          />
        )
      )}
    </div>
  )
}
