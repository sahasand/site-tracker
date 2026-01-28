import { getAllSitesWithMilestones } from '@/lib/queries/sites'
import { getStudies } from '@/lib/queries/studies'
import { getStuckSites } from '@/lib/queries/analytics'
import ActivationView from '@/components/activation/activation-view'

export default async function ActivationPage() {
  const [sites, studies, stuckSites] = await Promise.all([
    getAllSitesWithMilestones(),
    getStudies(),
    getStuckSites(14),
  ])

  // Filter out closed sites
  const activeSites = sites.filter(s => s.status !== 'closed')

  // Group sites by study
  const sitesByStudy = studies.map(study => ({
    study,
    sites: activeSites.filter(site => site.study_id === study.id)
  })).filter(group => group.sites.length > 0)

  const totalSites = activeSites.length
  const activatedCount = activeSites.filter(s => s.status === 'active').length
  const activatingCount = activeSites.filter(s => s.status === 'activating').length

  return (
    <ActivationView
      sitesByStudy={sitesByStudy}
      totalSites={totalSites}
      activatingCount={activatingCount}
      activatedCount={activatedCount}
      stuckSites={stuckSites}
    />
  )
}
