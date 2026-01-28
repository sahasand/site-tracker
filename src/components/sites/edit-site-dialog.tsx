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
import { updateSiteAction, deleteSiteAction } from '@/app/actions/sites'
import { COUNTRIES } from '@/lib/constants'
import type { Site, SiteStatus } from '@/types'

interface EditSiteDialogProps {
  site: Site
}

export default function EditSiteDialog({ site }: EditSiteDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    try {
      await deleteSiteAction(site.id, site.study_id)
      toast.success(`Site "${site.name}" deleted`)
      setOpen(false)
      router.push(`/studies/${site.study_id}`)
    } catch {
      toast.error('Failed to delete site. Please try again.')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const currentEnrollment = parseInt(formData.get('current_enrollment') as string) || 0
    const targetEnrollment = parseInt(formData.get('target_enrollment') as string) || 0

    if (currentEnrollment > targetEnrollment) {
      toast.error('Current enrollment cannot exceed target enrollment')
      setLoading(false)
      return
    }

    try {
      await updateSiteAction(site.id, site.study_id, {
        site_number: formData.get('site_number') as string,
        name: formData.get('name') as string,
        principal_investigator: formData.get('principal_investigator') as string,
        country: formData.get('country') as string,
        region: formData.get('region') as string || undefined,
        target_enrollment: targetEnrollment,
        current_enrollment: currentEnrollment,
        status: formData.get('status') as SiteStatus,
      })
      toast.success('Site updated successfully')
      setOpen(false)
    } catch {
      toast.error('Failed to update site. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit Site
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="site_number">Site Number</Label>
              <Input
                id="site_number"
                name="site_number"
                defaultValue={site.site_number}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Site Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={site.name}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="principal_investigator">Principal Investigator</Label>
            <Input
              id="principal_investigator"
              name="principal_investigator"
              defaultValue={site.principal_investigator}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Select name="country" defaultValue={COUNTRIES.includes(site.country as typeof COUNTRIES[number]) ? site.country : 'Other'}>
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
              <Input
                id="region"
                name="region"
                defaultValue={site.region || ''}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="target_enrollment">Target Enrollment</Label>
              <Input
                id="target_enrollment"
                name="target_enrollment"
                type="number"
                min="0"
                defaultValue={site.target_enrollment}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current_enrollment">Current Enrollment</Label>
              <Input
                id="current_enrollment"
                name="current_enrollment"
                type="number"
                min="0"
                defaultValue={site.current_enrollment}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={site.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="activating">Activating</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between">
            <ConfirmDialog
              title={`Delete Site ${site.site_number}?`}
              description="This will permanently delete this site and all its milestones. This action cannot be undone."
              confirmLabel="Delete Site"
              onConfirm={handleDelete}
              trigger={
                <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Delete Site
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
