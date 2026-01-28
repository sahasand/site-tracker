'use client'

import { useState } from 'react'
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
import { createStudyAction } from '@/app/actions/studies'
import type { StudyPhase } from '@/types'

export default function CreateStudyDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    await createStudyAction({
      name: formData.get('name') as string,
      protocol_number: formData.get('protocol_number') as string,
      sponsor_name: formData.get('sponsor_name') as string,
      phase: formData.get('phase') as StudyPhase,
      target_enrollment: parseInt(formData.get('target_enrollment') as string) || 0,
      enrollment_start_date: formData.get('enrollment_start_date') as string || undefined,
      planned_end_date: formData.get('planned_end_date') as string || undefined,
    })

    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Study</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Study</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Study Name</Label>
            <Input id="name" name="name" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="protocol_number">Protocol Number</Label>
            <Input id="protocol_number" name="protocol_number" required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="sponsor_name">Sponsor Name</Label>
            <Input id="sponsor_name" name="sponsor_name" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phase">Phase</Label>
              <Select name="phase" defaultValue="II">
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
                defaultValue="0"
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="planned_end_date">End Date</Label>
              <Input
                id="planned_end_date"
                name="planned_end_date"
                type="date"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Study'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
