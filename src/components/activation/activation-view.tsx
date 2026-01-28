'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ExportButton } from '@/components/ui/export-button'
import KanbanBoard from './kanban-board'
import BulkMilestoneDialog from './bulk-milestone-dialog'
import BottleneckAlerts from './bottleneck-alerts'
import type { Site, SiteActivationMilestone, Study, MilestoneType } from '@/types'

interface StudyGroup {
  study: Study
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
}

interface StuckSite {
  siteId: string
  siteName: string
  siteNumber: string
  studyId: string
  studyName: string
  milestoneType: MilestoneType
  milestoneLabel: string
  daysStuck: number
}

interface ActivationViewProps {
  sitesByStudy: StudyGroup[]
  totalSites: number
  activatingCount: number
  activatedCount: number
  stuckSites: StuckSite[]
}

export default function ActivationView({
  sitesByStudy,
  totalSites,
  activatingCount,
  activatedCount,
  stuckSites,
}: ActivationViewProps) {
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedSiteIds, setSelectedSiteIds] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)

  // Flatten all sites with study info for export
  const allSitesForExport = useMemo(() => {
    return sitesByStudy.flatMap(({ study, sites }) =>
      sites.map(site => ({ ...site, study }))
    )
  }, [sitesByStudy])

  function toggleSiteSelection(siteId: string) {
    setSelectedSiteIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(siteId)) {
        newSet.delete(siteId)
      } else {
        newSet.add(siteId)
      }
      return newSet
    })
  }

  function handleBulkComplete() {
    setSelectedSiteIds(new Set())
    setBulkMode(false)
  }

  function exitBulkMode() {
    setBulkMode(false)
    setSelectedSiteIds(new Set())
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Activation Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track site progress through activation milestones
          </p>
        </div>
        <div className="flex items-center gap-4">
          {bulkMode ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                {selectedSiteIds.size} selected
              </span>
              <Button
                onClick={() => setDialogOpen(true)}
                disabled={selectedSiteIds.size === 0}
                size="sm"
              >
                Update Milestones
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exitBulkMode}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <>
              <ExportButton
                sites={allSitesForExport}
                filename={`activation-pipeline-${new Date().toISOString().split('T')[0]}.csv`}
                includeStudy={true}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBulkMode(true)}
              >
                Bulk Update
              </Button>
              <div className="flex items-center gap-6 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-800">{totalSites}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Total</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <div className="text-lg font-semibold text-amber-600">{activatingCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">In Progress</div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center">
                  <div className="text-lg font-semibold text-emerald-600">{activatedCount}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Activated</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottleneck Alerts */}
      <BottleneckAlerts stuckSites={stuckSites} />

      {sitesByStudy.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">No sites in activation</h3>
          <p className="text-slate-500 text-sm">Add sites to a study to start tracking activation progress.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sitesByStudy.map(({ study, sites }) => (
            <div key={study.id} className="glass-card rounded-xl overflow-hidden">
              {/* Study Header */}
              <div className="px-5 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/studies/${study.id}`}
                      className="group flex items-center gap-2"
                    >
                      <h2 className="text-base font-semibold text-slate-800 group-hover:text-teal-700 transition-colors">
                        {study.name}
                      </h2>
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <span className={`phase-badge phase-badge-${study.phase}`}>
                      Phase {study.phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-medium">{study.protocol_number}</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span className="font-medium">{sites.length} site{sites.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="p-4 bg-gradient-to-b from-slate-50/50 to-white">
                <KanbanBoard
                  sites={sites}
                  bulkMode={bulkMode}
                  selectedSiteIds={selectedSiteIds}
                  onToggleSelection={toggleSiteSelection}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <BulkMilestoneDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedSiteIds={Array.from(selectedSiteIds)}
        onComplete={handleBulkComplete}
      />
    </div>
  )
}
