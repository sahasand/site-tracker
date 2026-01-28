import { getAllSitesWithMilestones } from '@/lib/queries/sites'
import KanbanBoard from '@/components/activation/kanban-board'

export default async function ActivationPage() {
  const sites = await getAllSitesWithMilestones()

  // Filter out closed sites
  const activeSites = sites.filter(s => s.status !== 'closed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Activation</h1>
        <div className="text-sm text-gray-500">
          {activeSites.length} sites in activation pipeline
        </div>
      </div>

      {activeSites.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No sites in activation. Add sites to a study to get started.</p>
        </div>
      ) : (
        <KanbanBoard sites={activeSites} />
      )}
    </div>
  )
}
