'use client'

import { COUNTRIES } from '@/lib/constants'
import type { CreateSiteInput } from '@/types'

export interface ParsedRow {
  rowNumber: number
  data: {
    site_number: string
    name: string
    principal_investigator: string
    country: string
    region: string
    target_enrollment: number
  }
  errors: string[]
  isValid: boolean
}

export interface ParseResult {
  rows: ParsedRow[]
  validCount: number
  invalidCount: number
}

const REQUIRED_HEADERS = ['site number', 'site name', 'principal investigator', 'country']

function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/[_-]/g, ' ')
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export function parseCSV(content: string, existingSiteNumbers: string[]): ParseResult {
  const lines = content.split(/\r?\n/).filter(line => line.trim())

  if (lines.length < 2) {
    return { rows: [], validCount: 0, invalidCount: 0 }
  }

  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine).map(normalizeHeader)

  // Map headers to column indices
  const headerMap: Record<string, number> = {}
  headers.forEach((header, index) => {
    headerMap[header] = index
  })

  // Check for required headers
  const missingHeaders = REQUIRED_HEADERS.filter(h => headerMap[h] === undefined)
  if (missingHeaders.length > 0) {
    // Return single error row indicating missing headers
    return {
      rows: [{
        rowNumber: 1,
        data: { site_number: '', name: '', principal_investigator: '', country: '', region: '', target_enrollment: 0 },
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`],
        isValid: false,
      }],
      validCount: 0,
      invalidCount: 1,
    }
  }

  const seenSiteNumbers = new Set<string>()
  const existingSet = new Set(existingSiteNumbers.map(n => n.toLowerCase()))

  const rows: ParsedRow[] = lines.slice(1).map((line, index) => {
    const values = parseCSVLine(line)
    const errors: string[] = []

    const getValue = (header: string): string => {
      const idx = headerMap[header]
      return idx !== undefined ? (values[idx] || '').trim() : ''
    }

    const site_number = getValue('site number')
    const name = getValue('site name')
    const principal_investigator = getValue('principal investigator')
    const country = getValue('country')
    const region = getValue('region')
    const targetStr = getValue('target enrollment')
    const target_enrollment = targetStr ? parseInt(targetStr, 10) : 0

    // Validate required fields
    if (!site_number) errors.push('Site Number is required')
    if (!name) errors.push('Site Name is required')
    if (!principal_investigator) errors.push('Principal Investigator is required')
    if (!country) errors.push('Country is required')

    // Validate site number uniqueness
    if (site_number) {
      const lowerSiteNum = site_number.toLowerCase()
      if (seenSiteNumbers.has(lowerSiteNum)) {
        errors.push(`Duplicate Site Number "${site_number}" in file`)
      } else if (existingSet.has(lowerSiteNum)) {
        errors.push(`Site Number "${site_number}" already exists in this study`)
      } else {
        seenSiteNumbers.add(lowerSiteNum)
      }
    }

    // Validate country
    if (country && !COUNTRIES.includes(country as typeof COUNTRIES[number]) && country !== 'Other') {
      errors.push(`Invalid country "${country}". Use one of: ${COUNTRIES.slice(0, 5).join(', ')}...`)
    }

    // Validate target enrollment
    if (targetStr && (isNaN(target_enrollment) || target_enrollment < 0)) {
      errors.push('Target Enrollment must be a positive number')
    }

    return {
      rowNumber: index + 2, // +2 for 1-indexed and header row
      data: {
        site_number,
        name,
        principal_investigator,
        country,
        region,
        target_enrollment: isNaN(target_enrollment) ? 0 : target_enrollment,
      },
      errors,
      isValid: errors.length === 0,
    }
  })

  return {
    rows,
    validCount: rows.filter(r => r.isValid).length,
    invalidCount: rows.filter(r => !r.isValid).length,
  }
}

export function getValidSiteInputs(rows: ParsedRow[], studyId: string): CreateSiteInput[] {
  return rows
    .filter(row => row.isValid)
    .map(row => ({
      study_id: studyId,
      site_number: row.data.site_number,
      name: row.data.name,
      principal_investigator: row.data.principal_investigator,
      country: row.data.country,
      region: row.data.region || undefined,
      target_enrollment: row.data.target_enrollment,
    }))
}

export function generateSampleCSV(): string {
  return `Site Number,Site Name,Principal Investigator,Country,Region,Target Enrollment
001,Mayo Clinic Rochester,Dr. Sarah Johnson,United States,Midwest,25
002,Berlin University Hospital,Dr. Hans Mueller,Germany,,30
003,Toronto General,Dr. Emily Chen,Canada,Ontario,20`
}
