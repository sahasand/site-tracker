'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { parseCSV, getValidSiteInputs, generateSampleCSV, type ParseResult, type ParsedRow } from '@/lib/csv-import'
import { bulkCreateSitesAction } from '@/app/actions/sites'

interface ImportCSVDialogProps {
  studyId: string
  existingSiteNumbers: string[]
}

type Step = 'upload' | 'preview'

export default function ImportCSVDialog({ studyId, existingSiteNumbers }: ImportCSVDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('upload')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  function reset() {
    setStep('upload')
    setParseResult(null)
    setLoading(false)
    setIsDragOver(false)
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      reset()
    }
  }

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = parseCSV(content, existingSiteNumbers)
      setParseResult(result)
      setStep('preview')
    }
    reader.onerror = () => {
      toast.error('Failed to read file')
    }
    reader.readAsText(file)
  }, [existingSiteNumbers])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFile(file)
    }
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  function downloadSample() {
    const content = generateSampleCSV()
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'sites-template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  async function handleImport() {
    if (!parseResult) return

    const validInputs = getValidSiteInputs(parseResult.rows, studyId)
    if (validInputs.length === 0) {
      toast.error('No valid sites to import')
      return
    }

    setLoading(true)
    try {
      await bulkCreateSitesAction(validInputs)

      if (parseResult.invalidCount > 0) {
        const skippedRows = parseResult.rows
          .filter(r => !r.isValid)
          .map(r => r.rowNumber)
          .join(', ')
        toast.success(`Imported ${validInputs.length} sites. ${parseResult.invalidCount} skipped (rows ${skippedRows})`)
      } else {
        toast.success(`Imported ${validInputs.length} sites successfully`)
      }

      setOpen(false)
    } catch {
      toast.error('Failed to import sites. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'upload' ? (
              <>
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Import Sites from CSV
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review Import
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-lg p-8 text-center transition-all
                ${isDragOver
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                }
              `}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${isDragOver ? 'bg-teal-100' : 'bg-slate-200'}`}>
                  <svg className={`w-6 h-6 ${isDragOver ? 'text-teal-600' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {isDragOver ? 'Drop your CSV file here' : 'Drop CSV file here or click to browse'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Maximum file size: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Expected format */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700">Expected Format</h4>
                <Button variant="ghost" size="sm" onClick={downloadSample} className="text-xs gap-1.5 h-7">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Template
                </Button>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex gap-4">
                  <div>
                    <span className="font-medium text-slate-600">Required:</span>
                    <span className="text-slate-500 ml-1">Site Number, Site Name, Principal Investigator, Country</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <span className="font-medium text-slate-600">Optional:</span>
                    <span className="text-slate-500 ml-1">Region, Target Enrollment</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded border border-slate-200 p-2 font-mono text-[11px] text-slate-600 overflow-x-auto">
                Site Number,Site Name,Principal Investigator,Country,Region,Target Enrollment<br />
                001,Mayo Clinic,Dr. Sarah Johnson,United States,Midwest,25
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && parseResult && (
          <div className="flex flex-col min-h-0 flex-1 space-y-4">
            {/* Summary bar */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm text-slate-600">
                  <span className="font-semibold text-emerald-700">{parseResult.validCount}</span> valid
                </span>
              </div>
              {parseResult.invalidCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-sm text-slate-600">
                    <span className="font-semibold text-red-700">{parseResult.invalidCount}</span> with errors
                  </span>
                </div>
              )}
              <div className="ml-auto">
                <Button variant="ghost" size="sm" onClick={reset} className="text-xs">
                  Choose different file
                </Button>
              </div>
            </div>

            {/* Preview table */}
            <div className="flex-1 min-h-0 overflow-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-slate-600 w-12">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Site #</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Name</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">PI</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Country</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-600">Region</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-600">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.rows.map((row) => (
                    <PreviewRow key={row.rowNumber} row={row} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={loading || parseResult.validCount === 0}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Importing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Import {parseResult.validCount} Site{parseResult.validCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PreviewRow({ row }: { row: ParsedRow }) {
  const [showErrors, setShowErrors] = useState(false)

  return (
    <>
      <tr
        className={`border-b last:border-0 ${row.isValid ? 'hover:bg-slate-50' : 'bg-red-50'}`}
        onMouseEnter={() => !row.isValid && setShowErrors(true)}
        onMouseLeave={() => setShowErrors(false)}
      >
        <td className="px-3 py-2">
          {row.isValid ? (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center cursor-help relative">
              <svg className="w-3 h-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </td>
        <td className="px-3 py-2 font-medium text-slate-800">{row.data.site_number || '—'}</td>
        <td className="px-3 py-2 text-slate-700 max-w-[140px] truncate">{row.data.name || '—'}</td>
        <td className="px-3 py-2 text-slate-600 max-w-[120px] truncate">{row.data.principal_investigator || '—'}</td>
        <td className="px-3 py-2 text-slate-600">{row.data.country || '—'}</td>
        <td className="px-3 py-2 text-slate-500">{row.data.region || '—'}</td>
        <td className="px-3 py-2 text-right text-slate-600">{row.data.target_enrollment}</td>
      </tr>
      {!row.isValid && showErrors && (
        <tr className="bg-red-50">
          <td colSpan={7} className="px-3 py-2">
            <div className="flex items-start gap-2 text-xs text-red-700">
              <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{row.errors.join('. ')}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
