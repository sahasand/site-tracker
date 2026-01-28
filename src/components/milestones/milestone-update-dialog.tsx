'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateMilestoneAction } from '@/app/actions/milestones'
import { MILESTONE_LABELS } from '@/types'
import type { SiteActivationMilestone, MilestoneStatus } from '@/types'

interface MilestoneUpdateDialogProps {
  milestone: SiteActivationMilestone
  siteId: string
  studyId: string
}

export default function MilestoneUpdateDialog({
  milestone,
  siteId,
  studyId,
}: MilestoneUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<MilestoneStatus>(milestone.status)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const newStatus = formData.get('status') as MilestoneStatus

    try {
      await updateMilestoneAction(milestone.id, siteId, studyId, {
        status: newStatus,
        planned_date: formData.get('planned_date') as string || null,
        actual_date: newStatus === 'completed'
          ? (formData.get('actual_date') as string || new Date().toISOString().split('T')[0])
          : null,
        notes: formData.get('notes') as string || null,
      })
      toast.success(`${MILESTONE_LABELS[milestone.milestone_type]} updated`)
      setOpen(false)
    } catch {
      toast.error('Failed to update milestone. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{MILESTONE_LABELS[milestone.milestone_type]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              defaultValue={milestone.status}
              onValueChange={(val) => setStatus(val as MilestoneStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="planned_date">Planned Date</Label>
            <Input
              id="planned_date"
              name="planned_date"
              type="date"
              defaultValue={milestone.planned_date || ''}
            />
          </div>

          {status === 'completed' && (
            <div className="grid gap-2">
              <Label htmlFor="actual_date">Completion Date</Label>
              <Input
                id="actual_date"
                name="actual_date"
                type="date"
                defaultValue={milestone.actual_date || new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Optional notes..."
              defaultValue={milestone.notes || ''}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
