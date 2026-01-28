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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createSiteAction } from '@/app/actions/sites'
import { COUNTRIES } from '@/lib/constants'

interface CreateSiteDialogProps {
  studyId: string
}

export default function CreateSiteDialog({ studyId }: CreateSiteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const siteName = formData.get('name') as string

    try {
      await createSiteAction({
        study_id: studyId,
        site_number: formData.get('site_number') as string,
        name: siteName,
        principal_investigator: formData.get('principal_investigator') as string,
        country: formData.get('country') as string,
        region: formData.get('region') as string || undefined,
        target_enrollment: parseInt(formData.get('target_enrollment') as string) || 0,
      })
      toast.success(`Site "${siteName}" added successfully`)
      setOpen(false)
    } catch {
      toast.error('Failed to add site. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Site</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="site_number">Site Number</Label>
              <Input id="site_number" name="site_number" placeholder="001" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Site Name</Label>
              <Input id="name" name="name" required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="principal_investigator">Principal Investigator</Label>
            <Input id="principal_investigator" name="principal_investigator" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Select name="country" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" name="region" placeholder="Optional" />
            </div>
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Site'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
