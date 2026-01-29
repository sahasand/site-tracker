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

interface MilestoneStepperProps {
  milestones: SiteActivationMilestone[]
  siteId: string
  studyId: string
}

const STEP_ICONS: Record<string, React.ReactNode> = {
  regulatory_submitted: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  regulatory_approved: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
  ),
  contract_sent: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  ),
  contract_executed: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  siv_scheduled: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  siv_completed: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  edc_training_complete: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
    </svg>
  ),
  site_activated: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
}

const SHORT_LABELS: Record<string, string> = {
  regulatory_submitted: 'Reg Submit',
  regulatory_approved: 'Reg Approved',
  contract_sent: 'Contract Out',
  contract_executed: 'Contract Sign',
  siv_scheduled: 'SIV Sched',
  siv_completed: 'SIV Done',
  edc_training_complete: 'EDC Train',
  site_activated: 'Activated',
}

export default function MilestoneStepper({ milestones, siteId, studyId }: MilestoneStepperProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null)

  // Sort milestones by order
  const sortedMilestones = MILESTONE_ORDER.map((type) =>
    milestones.find((m) => m.milestone_type === type)
  ).filter(Boolean) as SiteActivationMilestone[]

  // Find current step (first non-completed)
  const currentStepIndex = sortedMilestones.findIndex(m => m.status !== 'completed')
  const completedCount = currentStepIndex === -1 ? sortedMilestones.length : currentStepIndex

  return (
    <div className="space-y-4">
      {/* Progress bar background */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${(completedCount / (sortedMilestones.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {sortedMilestones.map((milestone, index) => (
            <MilestoneStep
              key={milestone.id}
              milestone={milestone}
              index={index}
              isCompleted={milestone.status === 'completed'}
              isCurrent={index === currentStepIndex}
              isOpen={openPopover === milestone.id}
              onOpenChange={(open) => setOpenPopover(open ? milestone.id : null)}
              siteId={siteId}
              studyId={studyId}
            />
          ))}
        </div>
      </div>

      {/* Summary text */}
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
        <span className="font-medium text-slate-700">{completedCount} of {sortedMilestones.length}</span>
        <span>milestones completed</span>
        {currentStepIndex !== -1 && (
          <>
            <span className="text-slate-300">·</span>
            <span>Next: <span className="font-medium text-teal-600">{SHORT_LABELS[sortedMilestones[currentStepIndex].milestone_type]}</span></span>
          </>
        )}
      </div>
    </div>
  )
}

interface MilestoneStepProps {
  milestone: SiteActivationMilestone
  index: number
  isCompleted: boolean
  isCurrent: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  siteId: string
  studyId: string
}

function MilestoneStep({
  milestone,
  isCompleted,
  isCurrent,
  isOpen,
  onOpenChange,
  siteId,
  studyId,
}: MilestoneStepProps) {
  const [loading, setLoading] = useState(false)

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
            group flex flex-col items-center gap-2 outline-none
            ${isCurrent ? 'scale-105' : ''}
            transition-transform duration-200
          `}
        >
          {/* Step circle */}
          <div
            className={`
              relative w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-300 ease-out
              ${isCompleted
                ? 'bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/25'
                : isCurrent
                  ? 'bg-white border-2 border-teal-500 text-teal-600 shadow-lg shadow-teal-500/20 ring-4 ring-teal-500/10'
                  : 'bg-slate-100 border border-slate-200 text-slate-400'
              }
              group-hover:scale-110 group-hover:shadow-xl
              ${isCompleted ? 'group-hover:shadow-teal-500/30' : ''}
              ${isCurrent ? 'animate-pulse-subtle' : ''}
            `}
          >
            {isCompleted ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              STEP_ICONS[milestone.milestone_type]
            )}
          </div>

          {/* Label */}
          <span
            className={`
              text-[11px] font-medium tracking-wide text-center max-w-[70px] leading-tight
              transition-colors duration-200
              ${isCompleted ? 'text-teal-700' : isCurrent ? 'text-teal-600' : 'text-slate-400'}
              group-hover:text-slate-700
            `}
          >
            {SHORT_LABELS[milestone.milestone_type]}
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 overflow-hidden" align="center">
        <div className={`
          px-4 py-3 border-b
          ${isCompleted
            ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-100'
            : isCurrent
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100'
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
                ? 'bg-teal-100 text-teal-700'
                : isCurrent
                  ? 'bg-amber-100 text-amber-700'
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
              <Label htmlFor="planned_date" className="text-xs text-slate-500">Planned</Label>
              <Input
                id="planned_date"
                name="planned_date"
                type="date"
                defaultValue={milestone.planned_date || ''}
                className="text-sm"
              />
            </div>
            {isCompleted && (
              <div className="grid gap-1.5">
                <Label htmlFor="actual_date" className="text-xs text-slate-500">Actual</Label>
                <Input
                  id="actual_date"
                  name="actual_date"
                  type="date"
                  defaultValue={milestone.actual_date || ''}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notes" className="text-xs text-slate-500">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Optional notes..."
              defaultValue={milestone.notes || ''}
              className="text-sm resize-none h-16"
            />
          </div>

          {/* Only show save button if not quick-completing */}
          {!isCurrent && (
            <Button type="submit" disabled={loading} className="w-full" variant="outline">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}

          {isCurrent && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400 text-center">
                Or edit dates/notes and click outside to dismiss
              </p>
            </div>
          )}
        </form>
      </PopoverContent>
    </Popover>
  )
}
