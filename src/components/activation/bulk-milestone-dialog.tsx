'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { bulkUpdateMilestonesAction } from '@/app/actions/milestones'
import { MILESTONE_LABELS } from '@/types'
import type { MilestoneType, MilestoneStatus } from '@/types'

interface BulkMilestoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedSiteIds: string[]
  onComplete: () => void
}

const MILESTONE_TYPES: MilestoneType[] = [
  'regulatory_submitted',
  'regulatory_approved',
  'contract_sent',
  'contract_executed',
  'siv_scheduled',
  'siv_completed',
  'edc_training_complete',
  'site_activated',
]

export default function BulkMilestoneDialog({
  open,
  onOpenChange,
  selectedSiteIds,
  onComplete,
}: BulkMilestoneDialogProps) {
  const [loading, setLoading] = useState(false)
  const [milestoneType, setMilestoneType] = useState<MilestoneType>('regulatory_submitted')
  const [status, setStatus] = useState<MilestoneStatus>('completed')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      await bulkUpdateMilestonesAction(
        selectedSiteIds,
        milestoneType,
        status,
        status === 'completed' ? date : null
      )
      toast.success(`Updated ${MILESTONE_LABELS[milestoneType]} for ${selectedSiteIds.length} sites`)
      onComplete()
      onOpenChange(false)
    } catch {
      toast.error('Failed to update milestones. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Bulk Update Milestones</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-slate-500">
            Updating {selectedSiteIds.length} site{selectedSiteIds.length !== 1 ? 's' : ''}
          </p>

          <div className="grid gap-2">
            <Label htmlFor="milestone_type">Milestone</Label>
            <Select
              value={milestoneType}
              onValueChange={(val) => setMilestoneType(val as MilestoneType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select milestone" />
              </SelectTrigger>
              <SelectContent>
                {MILESTONE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {MILESTONE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
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

          {status === 'completed' && (
            <div className="grid gap-2">
              <Label htmlFor="date">Completion Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update All'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
