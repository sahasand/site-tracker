'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import StudyCard from '@/components/studies/study-card'
import CreateStudyDialog from '@/components/studies/create-study-dialog'
import type { Study } from '@/types'

interface StudyListProps {
  studies: Study[]
  siteCounts: Record<string, number>
}

export default function StudyList({ studies, siteCounts }: StudyListProps) {
  const [search, setSearch] = useState('')

  const filteredStudies = useMemo(() => {
    if (!search.trim()) return studies
    const query = search.toLowerCase()
    return studies.filter(
      (study) =>
        study.name.toLowerCase().includes(query) ||
        study.protocol_number.toLowerCase().includes(query)
    )
  }, [studies, search])

  if (studies.length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">No studies yet</h3>
        <p className="text-slate-500 text-sm mb-4">Create your first study to get started tracking sites.</p>
        <CreateStudyDialog />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <Input
          type="search"
          placeholder="Search by name or protocol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredStudies.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">No results found</h3>
          <p className="text-slate-500 text-sm">
            No studies match &quot;{search}&quot;. Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudies.map((study, index) => (
            <div
              key={study.id}
              className="animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <StudyCard
                study={study}
                siteCount={siteCounts[study.id]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
