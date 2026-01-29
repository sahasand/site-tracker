'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateMilestoneAction } from '@/app/actions/milestones'
import type { SiteActivationMilestone, MilestoneStatus } from '@/types'
import { MILESTONE_ORDER, MILESTONE_LABELS } from '@/types'

interface ActivationTimelineProps {
  milestones: SiteActivationMilestone[]
  siteId: string
  studyId: string
}

const STAGE_GROUPS: { name: string; color: string; milestones: string[] }[] = [
  { name: 'Regulatory', color: 'blue', milestones: ['regulatory_submitted', 'regulatory_approved'] },
  { name: 'Contracts', color: 'violet', milestones: ['contract_sent', 'contract_executed'] },
  { name: 'Site Initiation', color: 'teal', milestones: ['siv_scheduled', 'siv_completed'] },
  { name: 'Training & Go-Live', color: 'amber', milestones: ['edc_training_complete', 'site_activated'] },
]

function calculateVariance(planned: string | null, actual: string | null): number | null {
  if (!planned || !actual) return null
  const plannedDate = new Date(planned)
  const actualDate = new Date(actual)
  return Math.round((actualDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(date: string | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ActivationTimeline({ milestones, siteId, studyId }: ActivationTimelineProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  // Sort milestones by order
  const sortedMilestones = MILESTONE_ORDER.map((type) =>
    milestones.find((m) => m.milestone_type === type)
  ).filter(Boolean) as SiteActivationMilestone[]

  // Calculate summary stats
  const completedMilestones = sortedMilestones.filter(m => m.status === 'completed')
  const totalVarianceDays = completedMilestones.reduce((sum, m) => {
    const variance = calculateVariance(m.planned_date, m.actual_date)
    return sum + (variance || 0)
  }, 0)

  const currentStepIndex = sortedMilestones.findIndex(m => m.status !== 'completed')

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Progress</p>
            <p className="text-lg font-semibold text-slate-800">
              {completedMilestones.length} <span className="text-slate-400 font-normal">of</span> {sortedMilestones.length}
            </p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Schedule Variance</p>
            <p className={`text-lg font-semibold ${
              totalVarianceDays === 0 ? 'text-slate-600' :
              totalVarianceDays < 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {totalVarianceDays === 0 ? 'On Track' :
               totalVarianceDays < 0 ? `${Math.abs(totalVarianceDays)}d ahead` :
               `${totalVarianceDays}d behind`}
            </p>
          </div>
        </div>
        {currentStepIndex !== -1 && (
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Next Step</p>
            <p className="text-sm font-medium text-teal-600">
              {MILESTONE_LABELS[sortedMilestones[currentStepIndex].milestone_type]}
            </p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {STAGE_GROUPS.map((stage) => {
          const stageMilestones = stage.milestones.map(type =>
            sortedMilestones.find(m => m.milestone_type === type)
          ).filter(Boolean) as SiteActivationMilestone[]

          const stageCompleted = stageMilestones.every(m => m.status === 'completed')
          const stageInProgress = stageMilestones.some(m => m.status === 'completed' || m.status === 'in_progress')

          return (
            <div key={stage.name} className="relative">
              {/* Stage Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  w-3 h-3 rounded-full
                  ${stageCompleted ? `bg-${stage.color}-500` :
                    stageInProgress ? `bg-${stage.color}-300` : 'bg-slate-200'}
                `} style={{
                  backgroundColor: stageCompleted ? `var(--stage-${stage.color})` :
                    stageInProgress ? `var(--stage-${stage.color}-light)` : undefined
                }} />
                <h3 className={`text-sm font-semibold tracking-wide uppercase ${
                  stageCompleted ? 'text-slate-700' :
                  stageInProgress ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {stage.name}
                </h3>
                {stageCompleted && (
                  <span className="text-xs text-emerald-600 font-medium">Complete</span>
                )}
              </div>

              {/* Milestones in this stage */}
              <div className="ml-1.5 pl-5 border-l-2 border-slate-200 space-y-2 pb-6">
                {stageMilestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    isOpen={openPopover === milestone.id}
                    onOpenChange={(open) => setOpenPopover(open ? milestone.id : null)}
                    siteId={siteId}
                    studyId={studyId}
                    isCurrent={sortedMilestones[currentStepIndex]?.id === milestone.id}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface MilestoneCardProps {
  milestone: SiteActivationMilestone
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  studyId: string
  isCurrent: boolean
}

function MilestoneCard({ milestone, isOpen, onOpenChange, siteId, studyId, isCurrent }: MilestoneCardProps) {
  const [loading, setLoading] = useState(false)
  const isCompleted = milestone.status === 'completed'
  const variance = calculateVariance(milestone.planned_date, milestone.actual_date)

  const handleQuickComplete = async () => {
    setLoading(true)
    try {
      await updateMilestoneAction(milestone.id, siteId, studyId, {
        status: 'completed',
        actual_date: new Date().toISOString().split('T')[0],
      })
      toast.success(`${MILESTONE_LABELS[milestone.milestone_type]} completed`)
      onOpenChange(false)
    } catch {
      toast.error('Failed to update milestone')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: FormData) => {
    setLoading(true)
    const status = formData.get('status') as MilestoneStatus
    try {
      await updateMilestoneAction(milestone.id, siteId, studyId, {
        status,
        planned_date: formData.get('planned_date') as string || null,
        actual_date: status === 'completed'
          ? (formData.get('actual_date') as string || new Date().toISOString().split('T')[0])
          : null,
        notes: formData.get('notes') as string || null,
      })
      toast.success(`${MILESTONE_LABELS[milestone.milestone_type]} updated`)
      onOpenChange(false)
    } catch {
      toast.error('Failed to update milestone')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          className={`
            w-full text-left p-3 rounded-lg border transition-all duration-200
            ${isCompleted
              ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
              : isCurrent
                ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-200 hover:border-teal-300 shadow-sm'
                : 'bg-slate-50 border-slate-100 hover:border-slate-200'
            }
          `}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Status indicator */}
              <div className={`
                mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                ${isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-200 text-slate-400'
                }
              `}>
                {isCompleted ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-slate-300 rounded-full" />
                )}
              </div>

              <div>
                <p className={`font-medium ${isCompleted ? 'text-slate-700' : isCurrent ? 'text-teal-700' : 'text-slate-400'}`}>
                  {MILESTONE_LABELS[milestone.milestone_type]}
                </p>

                {/* Dates row */}
                <div className="flex items-center gap-3 mt-1 text-xs">
                  {milestone.planned_date && (
                    <span className="text-slate-400">
                      Plan: {formatDate(milestone.planned_date)}
                    </span>
                  )}
                  {isCompleted && milestone.actual_date && (
                    <span className="text-slate-500">
                      Actual: {formatDate(milestone.actual_date)}
                    </span>
                  )}
                </div>

                {/* Notes preview */}
                {milestone.notes && (
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-1">
                    {milestone.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Variance badge */}
            {isCompleted && variance !== null && (
              <div className={`
                flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium
                ${variance === 0
                  ? 'bg-slate-100 text-slate-600'
                  : variance < 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }
              `}>
                {variance === 0 ? 'On time' : variance < 0 ? `${Math.abs(variance)}d early` : `${variance}d late`}
              </div>
            )}

            {/* Current step indicator */}
            {isCurrent && !isCompleted && (
              <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">
                Current
              </span>
            )}
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 overflow-hidden" align="start">
        <div className={`
          px-4 py-3 border-b
          ${isCompleted
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100'
            : isCurrent
              ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-100'
              : 'bg-slate-50 border-slate-100'
          }
        `}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">
              {MILESTONE_LABELS[milestone.milestone_type]}
            </h3>
            <span className={`
              text-xs font-medium px-2 py-0.5 rounded-full
              ${isCompleted
                ? 'bg-emerald-100 text-emerald-700'
                : isCurrent
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-slate-200 text-slate-600'
              }
            `}>
              {milestone.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <form action={handleSave} className="p-4 space-y-4">
          {/* Quick complete button for current step */}
          {isCurrent && (
            <Button
              type="button"
              onClick={handleQuickComplete}
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md"
            >
              {loading ? 'Completing...' : 'Mark Complete'}
            </Button>
          )}

          {/* Status select for non-current */}
          {!isCurrent && (
            <div className="grid gap-1.5">
              <Label htmlFor="status" className="text-xs text-slate-500">Status</Label>
              <select
                name="status"
                defaultValue={milestone.status}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="planned_date" className="text-xs text-slate-500">Planned Date</Label>
              <Input
                id="planned_date"
                name="planned_date"
                type="date"
                defaultValue={milestone.planned_date || ''}
                className="text-sm"
              />
            </div>
            {(isCompleted || isCurrent) && (
              <div className="grid gap-1.5">
                <Label htmlFor="actual_date" className="text-xs text-slate-500">Actual Date</Label>
                <Input
                  id="actual_date"
                  name="actual_date"
                  type="date"
                  defaultValue={milestone.actual_date || new Date().toISOString().split('T')[0]}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Variance display */}
          {isCompleted && variance !== null && (
            <div className={`
              p-2 rounded-md text-sm
              ${variance === 0
                ? 'bg-slate-50 text-slate-600'
                : variance < 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }
            `}>
              {variance === 0
                ? 'Completed on schedule'
                : variance < 0
                  ? `Completed ${Math.abs(variance)} days ahead of schedule`
                  : `Completed ${variance} days behind schedule`
              }
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="notes" className="text-xs text-slate-500">Notes / Blockers</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Document any delays, blockers, or important context..."
              defaultValue={milestone.notes || ''}
              className="text-sm resize-none h-20"
            />
          </div>

          {!isCurrent && (
            <Button type="submit" disabled={loading} className="w-full" variant="outline">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  )
}
