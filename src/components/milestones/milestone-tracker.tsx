import { Badge } from '@/components/ui/badge'
import MilestoneUpdateDialog from './milestone-update-dialog'
import type { SiteActivationMilestone } from '@/types'
import { MILESTONE_ORDER, MILESTONE_LABELS } from '@/types'

interface MilestoneTrackerProps {
  milestones: SiteActivationMilestone[]
  siteId: string
  studyId: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
}

export default function MilestoneTracker({ milestones, siteId, studyId }: MilestoneTrackerProps) {
  // Sort milestones by order
  const sortedMilestones = MILESTONE_ORDER.map((type) =>
    milestones.find((m) => m.milestone_type === type)
  ).filter(Boolean) as SiteActivationMilestone[]

  return (
    <div className="space-y-3">
      {sortedMilestones.map((milestone, index) => (
        <div
          key={milestone.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${statusColors[milestone.status]}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border text-sm font-medium">
              {index + 1}
            </div>
            <div>
              <p className="font-medium">{MILESTONE_LABELS[milestone.milestone_type]}</p>
              {milestone.actual_date && (
                <p className="text-sm opacity-75">
                  Completed: {new Date(milestone.actual_date).toLocaleDateString()}
                </p>
              )}
              {!milestone.actual_date && milestone.planned_date && (
                <p className="text-sm opacity-75">
                  Planned: {new Date(milestone.planned_date).toLocaleDateString()}
                </p>
              )}
              {milestone.notes && (
                <p className="text-sm opacity-75 mt-1">{milestone.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColors[milestone.status]}>
              {milestone.status.replace('_', ' ')}
            </Badge>
            <MilestoneUpdateDialog
              milestone={milestone}
              siteId={siteId}
              studyId={studyId}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
