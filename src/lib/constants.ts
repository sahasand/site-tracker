// Top clinical trial countries by site count
export const COUNTRIES = [
  'United States',
  'Germany',
  'United Kingdom',
  'France',
  'Spain',
  'Italy',
  'Canada',
  'Australia',
  'Japan',
  'South Korea',
  'China',
  'Brazil',
  'Poland',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Austria',
  'Sweden',
  'Denmark',
  'Israel',
] as const

export type Country = typeof COUNTRIES[number]
