'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { updateStudyAction, deleteStudyAction } from '@/app/actions/studies'
import type { Study, StudyPhase } from '@/types'

interface EditStudyDialogProps {
  study: Study
  siteCount?: number
}

export default function EditStudyDialog({ study, siteCount = 0 }: EditStudyDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    try {
      await deleteStudyAction(study.id)
      toast.success(`Study "${study.name}" deleted`)
      setOpen(false)
      router.push('/')
    } catch {
      toast.error('Failed to delete study. Please try again.')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      await updateStudyAction(study.id, {
        name: formData.get('name') as string,
        protocol_number: formData.get('protocol_number') as string,
        sponsor_name: formData.get('sponsor_name') as string,
        phase: formData.get('phase') as StudyPhase,
        target_enrollment: parseInt(formData.get('target_enrollment') as string) || 0,
        enrollment_start_date: formData.get('enrollment_start_date') as string || undefined,
        planned_end_date: formData.get('planned_end_date') as string || undefined,
      })
      toast.success('Study updated successfully')
      setOpen(false)
    } catch {
      toast.error('Failed to update study. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Format dates for input fields (YYYY-MM-DD)
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit Study
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Study</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Study Name</Label>
            <Input id="name" name="name" defaultValue={study.name} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="protocol_number">Protocol Number</Label>
            <Input id="protocol_number" name="protocol_number" defaultValue={study.protocol_number} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sponsor_name">Sponsor Name</Label>
            <Input id="sponsor_name" name="sponsor_name" defaultValue={study.sponsor_name} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phase">Phase</Label>
              <Select name="phase" defaultValue={study.phase}>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="I">Phase I</SelectItem>
                  <SelectItem value="II">Phase II</SelectItem>
                  <SelectItem value="III">Phase III</SelectItem>
                  <SelectItem value="IV">Phase IV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="target_enrollment">Target Enrollment</Label>
              <Input
                id="target_enrollment"
                name="target_enrollment"
                type="number"
                min="0"
                defaultValue={study.target_enrollment}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="enrollment_start_date">Start Date</Label>
              <Input
                id="enrollment_start_date"
                name="enrollment_start_date"
                type="date"
                defaultValue={formatDate(study.enrollment_start_date)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="planned_end_date">End Date</Label>
              <Input
                id="planned_end_date"
                name="planned_end_date"
                type="date"
                defaultValue={formatDate(study.planned_end_date)}
              />
            </div>
          </div>

          <div className="flex justify-between">
            <ConfirmDialog
              title={`Delete ${study.name}?`}
              description={siteCount > 0
                ? `This will permanently delete this study and all ${siteCount} site${siteCount > 1 ? 's' : ''} with their milestones. This action cannot be undone.`
                : 'This will permanently delete this study. This action cannot be undone.'
              }
              confirmLabel="Delete Study"
              onConfirm={handleDelete}
              trigger={
                <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Delete Study
                </Button>
              }
            />
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
