# Phase 1 MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working clinical trial site tracker with study/site CRUD, milestone tracking, and basic activation kanban.

**Architecture:** Next.js 14 App Router with Supabase Postgres backend. Server components for data fetching, client components for interactivity. TanStack Query for client-side state management.

**Tech Stack:** Next.js 14, Supabase, Tailwind CSS, shadcn/ui, TanStack Query, TypeScript

---

## Task 1: Project Initialization

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, etc. (via CLI)
- Create: `.env.local`

**Step 1: Create Next.js project**

```bash
cd /Users/sanman/Documents/site-tracker/.worktrees/mvp
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --yes
```

Note: Using `.` to initialize in current directory.

**Step 2: Install dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query @tanstack/react-query-devtools recharts date-fns
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Use defaults: New York style, Slate color, CSS variables enabled.

**Step 4: Add shadcn components**

```bash
npx shadcn@latest add button card input label table dialog dropdown-menu badge select textarea tabs
```

**Step 5: Create environment file**

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**Step 6: Verify setup**

```bash
npm run dev
```

Expected: Dev server starts at http://localhost:3000

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js project with dependencies"
```

---

## Task 2: Supabase Client Setup

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/middleware.ts`

**Step 1: Create browser client**

Create `src/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Step 2: Create server client**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  )
}
```

**Step 3: Create middleware**

Create `src/middleware.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Step 4: Commit**

```bash
git add src/lib/supabase src/middleware.ts
git commit -m "feat: add Supabase client configuration"
```

---

## Task 3: TanStack Query Setup

**Files:**
- Create: `src/lib/query-client.ts`
- Create: `src/app/providers.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create query client**

Create `src/lib/query-client.ts`:

```typescript
import {
  isServer,
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
```

**Step 2: Create providers**

Create `src/app/providers.tsx`:

```typescript
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { getQueryClient } from '@/lib/query-client'

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

**Step 3: Update layout**

Modify `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Site Tracker',
  description: 'Clinical trial site tracking dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**Step 4: Commit**

```bash
git add src/lib/query-client.ts src/app/providers.tsx src/app/layout.tsx
git commit -m "feat: add TanStack Query provider setup"
```

---

## Task 4: TypeScript Types

**Files:**
- Create: `src/types/index.ts`

**Step 1: Create type definitions**

Create `src/types/index.ts`:

```typescript
export type StudyPhase = 'I' | 'II' | 'III' | 'IV'
export type StudyStatus = 'active' | 'completed' | 'on_hold'

export type SiteStatus = 'planned' | 'activating' | 'active' | 'on_hold' | 'closed'

export type MilestoneType =
  | 'regulatory_submitted'
  | 'regulatory_approved'
  | 'contract_sent'
  | 'contract_executed'
  | 'siv_scheduled'
  | 'siv_completed'
  | 'edc_training_complete'
  | 'site_activated'

export type MilestoneStatus = 'pending' | 'in_progress' | 'completed'

export interface Study {
  id: string
  name: string
  protocol_number: string
  sponsor_name: string
  phase: StudyPhase
  status: StudyStatus
  target_enrollment: number
  enrollment_start_date: string | null
  planned_end_date: string | null
  created_at: string
  updated_at: string
}

export interface Site {
  id: string
  study_id: string
  site_number: string
  name: string
  principal_investigator: string
  country: string
  region: string | null
  status: SiteStatus
  target_enrollment: number
  current_enrollment: number
  created_at: string
  updated_at: string
}

export interface SiteActivationMilestone {
  id: string
  site_id: string
  milestone_type: MilestoneType
  status: MilestoneStatus
  planned_date: string | null
  actual_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SitePerformanceMetric {
  id: string
  site_id: string
  period: string
  queries_opened: number
  queries_resolved: number
  avg_resolution_days: number | null
  data_entry_lag_days: number | null
  protocol_deviations: number
  visit_completion_rate: number | null
  performance_score: number | null
  recorded_at: string
}

// Form input types
export interface CreateStudyInput {
  name: string
  protocol_number: string
  sponsor_name: string
  phase: StudyPhase
  target_enrollment: number
  enrollment_start_date?: string
  planned_end_date?: string
}

export interface CreateSiteInput {
  study_id: string
  site_number: string
  name: string
  principal_investigator: string
  country: string
  region?: string
  target_enrollment: number
}

export interface UpdateMilestoneInput {
  status: MilestoneStatus
  planned_date?: string | null
  actual_date?: string | null
  notes?: string | null
}

// Milestone display order
export const MILESTONE_ORDER: MilestoneType[] = [
  'regulatory_submitted',
  'regulatory_approved',
  'contract_sent',
  'contract_executed',
  'siv_scheduled',
  'siv_completed',
  'edc_training_complete',
  'site_activated',
]

export const MILESTONE_LABELS: Record<MilestoneType, string> = {
  regulatory_submitted: 'Regulatory Submitted',
  regulatory_approved: 'Regulatory Approved',
  contract_sent: 'Contract Sent',
  contract_executed: 'Contract Executed',
  siv_scheduled: 'SIV Scheduled',
  siv_completed: 'SIV Completed',
  edc_training_complete: 'EDC Training Complete',
  site_activated: 'Site Activated',
}
```

**Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add TypeScript type definitions"
```

---

## Task 5: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

**Step 1: Create migrations directory**

```bash
mkdir -p supabase/migrations
```

**Step 2: Create schema migration**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
-- Studies table
CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  protocol_number TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('I', 'II', 'III', 'IV')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold')),
  target_enrollment INTEGER NOT NULL DEFAULT 0,
  enrollment_start_date DATE,
  planned_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sites table
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  site_number TEXT NOT NULL,
  name TEXT NOT NULL,
  principal_investigator TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'activating', 'active', 'on_hold', 'closed')),
  target_enrollment INTEGER NOT NULL DEFAULT 0,
  current_enrollment INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site activation milestones table
CREATE TABLE site_activation_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN (
    'regulatory_submitted',
    'regulatory_approved',
    'contract_sent',
    'contract_executed',
    'siv_scheduled',
    'siv_completed',
    'edc_training_complete',
    'site_activated'
  )),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  planned_date DATE,
  actual_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, milestone_type)
);

-- Site performance metrics table
CREATE TABLE site_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  queries_opened INTEGER NOT NULL DEFAULT 0,
  queries_resolved INTEGER NOT NULL DEFAULT 0,
  avg_resolution_days DECIMAL(5,2),
  data_entry_lag_days DECIMAL(5,2),
  protocol_deviations INTEGER NOT NULL DEFAULT 0,
  visit_completion_rate DECIMAL(5,2),
  performance_score DECIMAL(5,2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(site_id, period)
);

-- Indexes for common queries
CREATE INDEX idx_sites_study_id ON sites(study_id);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_milestones_site_id ON site_activation_milestones(site_id);
CREATE INDEX idx_milestones_status ON site_activation_milestones(status);
CREATE INDEX idx_performance_site_id ON site_performance_metrics(site_id);
CREATE INDEX idx_performance_period ON site_performance_metrics(period);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON site_activation_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create default milestones when a site is created
CREATE OR REPLACE FUNCTION create_site_milestones()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO site_activation_milestones (site_id, milestone_type, status)
  VALUES
    (NEW.id, 'regulatory_submitted', 'pending'),
    (NEW.id, 'regulatory_approved', 'pending'),
    (NEW.id, 'contract_sent', 'pending'),
    (NEW.id, 'contract_executed', 'pending'),
    (NEW.id, 'siv_scheduled', 'pending'),
    (NEW.id, 'siv_completed', 'pending'),
    (NEW.id, 'edc_training_complete', 'pending'),
    (NEW.id, 'site_activated', 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_milestones_on_site_insert
  AFTER INSERT ON sites
  FOR EACH ROW EXECUTE FUNCTION create_site_milestones();

-- Enable Row Level Security (disabled for now - no auth)
-- ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_activation_milestones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE site_performance_metrics ENABLE ROW LEVEL SECURITY;
```

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add Supabase database schema migration"
```

**Step 4: Apply migration in Supabase**

Go to Supabase Dashboard > SQL Editor and run the migration SQL.

---

## Task 6: Database Query Functions

**Files:**
- Create: `src/lib/queries/studies.ts`
- Create: `src/lib/queries/sites.ts`
- Create: `src/lib/queries/milestones.ts`

**Step 1: Create studies queries**

Create `src/lib/queries/studies.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Study, CreateStudyInput } from '@/types'

export async function getStudies(): Promise<Study[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getStudy(id: string): Promise<Study | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createStudy(input: CreateStudyInput): Promise<Study> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .insert({
      ...input,
      status: 'active',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateStudy(id: string, input: Partial<CreateStudyInput>): Promise<Study> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('studies')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteStudy(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('studies')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

**Step 2: Create sites queries**

Create `src/lib/queries/sites.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import type { Site, CreateSiteInput, SiteActivationMilestone } from '@/types'

export async function getSitesByStudy(studyId: string): Promise<Site[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('study_id', studyId)
    .order('site_number', { ascending: true })

  if (error) throw error
  return data
}

export async function getSite(id: string): Promise<Site | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getSiteWithMilestones(id: string): Promise<{
  site: Site
  milestones: SiteActivationMilestone[]
} | null> {
  const supabase = await createClient()

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', id)
    .single()

  if (siteError) throw siteError
  if (!site) return null

  const { data: milestones, error: milestonesError } = await supabase
    .from('site_activation_milestones')
    .select('*')
    .eq('site_id', id)
    .order('created_at', { ascending: true })

  if (milestonesError) throw milestonesError

  return { site, milestones }
}

export async function createSite(input: CreateSiteInput): Promise<Site> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .insert({
      ...input,
      status: 'planned',
      current_enrollment: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateSite(id: string, input: Partial<CreateSiteInput>): Promise<Site> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sites')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteSite(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getAllSitesWithMilestones(): Promise<Array<Site & { milestones: SiteActivationMilestone[] }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sites')
    .select(`
      *,
      milestones:site_activation_milestones(*)
    `)
    .order('site_number', { ascending: true })

  if (error) throw error
  return data
}
```

**Step 3: Create milestones queries**

Create `src/lib/queries/milestones.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import type { SiteActivationMilestone, UpdateMilestoneInput, SiteStatus } from '@/types'

export async function getMilestonesBySite(siteId: string): Promise<SiteActivationMilestone[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_activation_milestones')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function updateMilestone(
  id: string,
  input: UpdateMilestoneInput
): Promise<SiteActivationMilestone> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('site_activation_milestones')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateMilestoneAndSiteStatus(
  milestoneId: string,
  siteId: string,
  milestoneInput: UpdateMilestoneInput
): Promise<SiteActivationMilestone> {
  const supabase = await createClient()

  // Update the milestone
  const { data: milestone, error: milestoneError } = await supabase
    .from('site_activation_milestones')
    .update(milestoneInput)
    .eq('id', milestoneId)
    .select()
    .single()

  if (milestoneError) throw milestoneError

  // Get all milestones for this site to determine status
  const { data: allMilestones, error: fetchError } = await supabase
    .from('site_activation_milestones')
    .select('*')
    .eq('site_id', siteId)

  if (fetchError) throw fetchError

  // Determine new site status
  const siteActivated = allMilestones.find(m => m.milestone_type === 'site_activated')
  const anyInProgress = allMilestones.some(m => m.status === 'in_progress')
  const anyCompleted = allMilestones.some(m => m.status === 'completed')

  let newStatus: SiteStatus = 'planned'
  if (siteActivated?.status === 'completed') {
    newStatus = 'active'
  } else if (anyInProgress || anyCompleted) {
    newStatus = 'activating'
  }

  // Update site status
  const { error: siteError } = await supabase
    .from('sites')
    .update({ status: newStatus })
    .eq('id', siteId)

  if (siteError) throw siteError

  return milestone
}
```

**Step 4: Commit**

```bash
git add src/lib/queries/
git commit -m "feat: add database query functions"
```

---

## Task 7: Server Actions

**Files:**
- Create: `src/app/actions/studies.ts`
- Create: `src/app/actions/sites.ts`
- Create: `src/app/actions/milestones.ts`

**Step 1: Create study actions**

Create `src/app/actions/studies.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createStudy, updateStudy, deleteStudy } from '@/lib/queries/studies'
import type { CreateStudyInput } from '@/types'

export async function createStudyAction(input: CreateStudyInput) {
  const study = await createStudy(input)
  revalidatePath('/')
  return study
}

export async function updateStudyAction(id: string, input: Partial<CreateStudyInput>) {
  const study = await updateStudy(id, input)
  revalidatePath('/')
  revalidatePath(`/studies/${id}`)
  return study
}

export async function deleteStudyAction(id: string) {
  await deleteStudy(id)
  revalidatePath('/')
}
```

**Step 2: Create site actions**

Create `src/app/actions/sites.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createSite, updateSite, deleteSite } from '@/lib/queries/sites'
import type { CreateSiteInput } from '@/types'

export async function createSiteAction(input: CreateSiteInput) {
  const site = await createSite(input)
  revalidatePath(`/studies/${input.study_id}`)
  revalidatePath('/activation')
  return site
}

export async function updateSiteAction(id: string, studyId: string, input: Partial<CreateSiteInput>) {
  const site = await updateSite(id, input)
  revalidatePath(`/studies/${studyId}`)
  revalidatePath(`/sites/${id}`)
  revalidatePath('/activation')
  return site
}

export async function deleteSiteAction(id: string, studyId: string) {
  await deleteSite(id)
  revalidatePath(`/studies/${studyId}`)
  revalidatePath('/activation')
}
```

**Step 3: Create milestone actions**

Create `src/app/actions/milestones.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { updateMilestoneAndSiteStatus } from '@/lib/queries/milestones'
import type { UpdateMilestoneInput } from '@/types'

export async function updateMilestoneAction(
  milestoneId: string,
  siteId: string,
  studyId: string,
  input: UpdateMilestoneInput
) {
  const milestone = await updateMilestoneAndSiteStatus(milestoneId, siteId, input)
  revalidatePath(`/sites/${siteId}`)
  revalidatePath(`/studies/${studyId}`)
  revalidatePath('/activation')
  return milestone
}
```

**Step 4: Commit**

```bash
git add src/app/actions/
git commit -m "feat: add server actions for CRUD operations"
```

---

## Task 8: Layout Components

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/nav.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create header component**

Create `src/components/layout/header.tsx`:

```typescript
import Link from 'next/link'
import Nav from './nav'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Site Tracker
        </Link>
        <Nav />
      </div>
    </header>
  )
}
```

**Step 2: Create nav component**

Create `src/components/layout/nav.tsx`:

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Studies' },
  { href: '/activation', label: 'Activation' },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-gray-900',
            pathname === item.href
              ? 'text-gray-900'
              : 'text-gray-500'
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
```

**Step 3: Update layout**

Modify `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Header from '@/components/layout/header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Site Tracker',
  description: 'Clinical trial site tracking dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
```

**Step 4: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: add layout header and navigation"
```

---

## Task 9: Study List Page (Home)

**Files:**
- Create: `src/components/studies/study-card.tsx`
- Create: `src/components/studies/create-study-dialog.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create study card component**

Create `src/components/studies/study-card.tsx`:

```typescript
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Study } from '@/types'

interface StudyCardProps {
  study: Study
  siteCount: number
}

export default function StudyCard({ study, siteCount }: StudyCardProps) {
  return (
    <Link href={`/studies/${study.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{study.name}</CardTitle>
            <Badge variant="outline">Phase {study.phase}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Protocol:</span> {study.protocol_number}
            </p>
            <p>
              <span className="font-medium">Sponsor:</span> {study.sponsor_name}
            </p>
            <p>
              <span className="font-medium">Sites:</span> {siteCount}
            </p>
            <p>
              <span className="font-medium">Target Enrollment:</span> {study.target_enrollment}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

**Step 2: Create study dialog component**

Create `src/components/studies/create-study-dialog.tsx`:

```typescript
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
```

**Step 3: Update home page**

Modify `src/app/page.tsx`:

```typescript
import { getStudies } from '@/lib/queries/studies'
import { createClient } from '@/lib/supabase/server'
import StudyCard from '@/components/studies/study-card'
import CreateStudyDialog from '@/components/studies/create-study-dialog'

export default async function HomePage() {
  const studies = await getStudies()
  const supabase = await createClient()

  // Get site counts for each study
  const siteCounts: Record<string, number> = {}
  for (const study of studies) {
    const { count } = await supabase
      .from('sites')
      .select('*', { count: 'exact', head: true })
      .eq('study_id', study.id)
    siteCounts[study.id] = count || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Studies</h1>
        <CreateStudyDialog />
      </div>

      {studies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No studies yet. Create your first study to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              siteCount={siteCounts[study.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 4: Verify**

```bash
npm run dev
```

Expected: Home page shows studies grid with "Add Study" button.

**Step 5: Commit**

```bash
git add src/components/studies/ src/app/page.tsx
git commit -m "feat: add study list page with create dialog"
```

---

## Task 10: Study Detail Page with Sites

**Files:**
- Create: `src/app/studies/[id]/page.tsx`
- Create: `src/components/sites/site-table.tsx`
- Create: `src/components/sites/create-site-dialog.tsx`

**Step 1: Create site table component**

Create `src/components/sites/site-table.tsx`:

```typescript
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Site } from '@/types'

interface SiteTableProps {
  sites: Site[]
}

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  activating: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function SiteTable({ sites }: SiteTableProps) {
  if (sites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No sites yet. Add your first site to get started.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site #</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>PI</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Enrollment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map((site) => (
          <TableRow key={site.id}>
            <TableCell>
              <Link
                href={`/sites/${site.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                {site.site_number}
              </Link>
            </TableCell>
            <TableCell>{site.name}</TableCell>
            <TableCell>{site.principal_investigator}</TableCell>
            <TableCell>{site.country}</TableCell>
            <TableCell>
              <Badge className={statusColors[site.status]}>
                {site.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {site.current_enrollment} / {site.target_enrollment}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

**Step 2: Create site dialog component**

Create `src/components/sites/create-site-dialog.tsx`:

```typescript
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
import { createSiteAction } from '@/app/actions/sites'

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

    await createSiteAction({
      study_id: studyId,
      site_number: formData.get('site_number') as string,
      name: formData.get('name') as string,
      principal_investigator: formData.get('principal_investigator') as string,
      country: formData.get('country') as string,
      region: formData.get('region') as string || undefined,
      target_enrollment: parseInt(formData.get('target_enrollment') as string) || 0,
    })

    setLoading(false)
    setOpen(false)
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
              <Input id="country" name="country" required />
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
```

**Step 3: Create study detail page**

Create `src/app/studies/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStudy } from '@/lib/queries/studies'
import { getSitesByStudy } from '@/lib/queries/sites'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SiteTable from '@/components/sites/site-table'
import CreateSiteDialog from '@/components/sites/create-site-dialog'

interface StudyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudyDetailPage({ params }: StudyDetailPageProps) {
  const { id } = await params
  const study = await getStudy(id)

  if (!study) {
    notFound()
  }

  const sites = await getSitesByStudy(id)

  const activeSites = sites.filter(s => s.status === 'active').length
  const activatingSites = sites.filter(s => s.status === 'activating').length
  const totalEnrollment = sites.reduce((sum, s) => sum + s.current_enrollment, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-500 hover:text-gray-900">
          ← Studies
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{study.name}</h1>
          <p className="text-gray-500">{study.protocol_number}</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Phase {study.phase}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{sites.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeSites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Activating</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{activatingSites}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalEnrollment} / {study.target_enrollment}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sites</CardTitle>
          <CreateSiteDialog studyId={id} />
        </CardHeader>
        <CardContent>
          <SiteTable sites={sites} />
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 4: Verify**

```bash
npm run dev
```

Expected: Clicking a study opens detail page with site table and "Add Site" button.

**Step 5: Commit**

```bash
git add src/app/studies/ src/components/sites/
git commit -m "feat: add study detail page with site management"
```

---

## Task 11: Site Detail Page with Milestones

**Files:**
- Create: `src/app/sites/[id]/page.tsx`
- Create: `src/components/milestones/milestone-tracker.tsx`
- Create: `src/components/milestones/milestone-update-dialog.tsx`

**Step 1: Create milestone tracker component**

Create `src/components/milestones/milestone-tracker.tsx`:

```typescript
import { Badge } from '@/components/ui/badge'
import MilestoneUpdateDialog from './milestone-update-dialog'
import type { SiteActivationMilestone } from '@/types'
import { MILESTONE_ORDER, MILESTONE_LABELS } from '@/types'

interface MilestoneTrackerProps {
  milestones: SiteActivationMilestone[]
  siteId: string
  studyId: string
}

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
}

export default function MilestoneTracker({ milestones, siteId, studyId }: MilestoneTrackerProps) {
  // Sort milestones by order
  const sortedMilestones = MILESTONE_ORDER.map((type) =>
    milestones.find((m) => m.milestone_type === type)
  ).filter(Boolean) as SiteActivationMilestone[]

  return (
    <div className="space-y-3">
      {sortedMilestones.map((milestone, index) => (
        <div
          key={milestone.id}
          className={`flex items-center justify-between p-4 rounded-lg border ${statusColors[milestone.status]}`}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border text-sm font-medium">
              {index + 1}
            </div>
            <div>
              <p className="font-medium">{MILESTONE_LABELS[milestone.milestone_type]}</p>
              {milestone.actual_date && (
                <p className="text-sm opacity-75">
                  Completed: {new Date(milestone.actual_date).toLocaleDateString()}
                </p>
              )}
              {!milestone.actual_date && milestone.planned_date && (
                <p className="text-sm opacity-75">
                  Planned: {new Date(milestone.planned_date).toLocaleDateString()}
                </p>
              )}
              {milestone.notes && (
                <p className="text-sm opacity-75 mt-1">{milestone.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={statusColors[milestone.status]}>
              {milestone.status.replace('_', ' ')}
            </Badge>
            <MilestoneUpdateDialog
              milestone={milestone}
              siteId={siteId}
              studyId={studyId}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```

**Step 2: Create milestone update dialog**

Create `src/components/milestones/milestone-update-dialog.tsx`:

```typescript
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateMilestoneAction } from '@/app/actions/milestones'
import { MILESTONE_LABELS } from '@/types'
import type { SiteActivationMilestone, MilestoneStatus } from '@/types'

interface MilestoneUpdateDialogProps {
  milestone: SiteActivationMilestone
  siteId: string
  studyId: string
}

export default function MilestoneUpdateDialog({
  milestone,
  siteId,
  studyId,
}: MilestoneUpdateDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<MilestoneStatus>(milestone.status)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const newStatus = formData.get('status') as MilestoneStatus

    await updateMilestoneAction(milestone.id, siteId, studyId, {
      status: newStatus,
      planned_date: formData.get('planned_date') as string || null,
      actual_date: newStatus === 'completed'
        ? (formData.get('actual_date') as string || new Date().toISOString().split('T')[0])
        : null,
      notes: formData.get('notes') as string || null,
    })

    setLoading(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{MILESTONE_LABELS[milestone.milestone_type]}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              name="status"
              defaultValue={milestone.status}
              onValueChange={(val) => setStatus(val as MilestoneStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="planned_date">Planned Date</Label>
            <Input
              id="planned_date"
              name="planned_date"
              type="date"
              defaultValue={milestone.planned_date || ''}
            />
          </div>

          {status === 'completed' && (
            <div className="grid gap-2">
              <Label htmlFor="actual_date">Completion Date</Label>
              <Input
                id="actual_date"
                name="actual_date"
                type="date"
                defaultValue={milestone.actual_date || new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Optional notes..."
              defaultValue={milestone.notes || ''}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 3: Create site detail page**

Create `src/app/sites/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getSiteWithMilestones } from '@/lib/queries/sites'
import { getStudy } from '@/lib/queries/studies'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import MilestoneTracker from '@/components/milestones/milestone-tracker'

interface SiteDetailPageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  activating: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-red-100 text-red-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default async function SiteDetailPage({ params }: SiteDetailPageProps) {
  const { id } = await params
  const result = await getSiteWithMilestones(id)

  if (!result) {
    notFound()
  }

  const { site, milestones } = result
  const study = await getStudy(site.study_id)

  if (!study) {
    notFound()
  }

  const completedMilestones = milestones.filter(m => m.status === 'completed').length
  const totalMilestones = milestones.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/studies/${site.study_id}`} className="text-gray-500 hover:text-gray-900">
          ← {study.name}
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Site {site.site_number}
            </h1>
            <Badge className={statusColors[site.status]}>
              {site.status}
            </Badge>
          </div>
          <p className="text-gray-500">{site.name}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Principal Investigator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{site.principal_investigator}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {site.region ? `${site.region}, ` : ''}{site.country}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {site.current_enrollment} / {site.target_enrollment}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Activation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {completedMilestones} / {totalMilestones} milestones
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activation Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <MilestoneTracker
            milestones={milestones}
            siteId={site.id}
            studyId={site.study_id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 4: Verify**

```bash
npm run dev
```

Expected: Clicking a site opens detail page with milestone tracker and edit dialogs.

**Step 5: Commit**

```bash
git add src/app/sites/ src/components/milestones/
git commit -m "feat: add site detail page with milestone tracker"
```

---

## Task 12: Activation Kanban View

**Files:**
- Create: `src/app/activation/page.tsx`
- Create: `src/components/activation/kanban-board.tsx`
- Create: `src/components/activation/kanban-column.tsx`
- Create: `src/components/activation/site-card.tsx`

**Step 1: Create site card for kanban**

Create `src/components/activation/site-card.tsx`:

```typescript
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Site, SiteActivationMilestone } from '@/types'

interface SiteCardProps {
  site: Site & { milestones: SiteActivationMilestone[] }
  currentStage: string
}

export default function SiteCard({ site, currentStage }: SiteCardProps) {
  const currentMilestone = site.milestones.find(m =>
    m.status === 'in_progress' ||
    (m.status === 'pending' && site.milestones.every(om =>
      om.status === 'pending' || om.milestone_type === m.milestone_type
    ))
  )

  const daysInStage = currentMilestone?.updated_at
    ? Math.floor((Date.now() - new Date(currentMilestone.updated_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <Link href={`/sites/${site.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm">Site {site.site_number}</span>
            {daysInStage > 0 && (
              <span className={`text-xs px-2 py-1 rounded ${
                daysInStage > 14 ? 'bg-red-100 text-red-700' :
                daysInStage > 7 ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {daysInStage}d
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 truncate">{site.name}</p>
          <p className="text-xs text-gray-400 mt-1">{site.principal_investigator}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

**Step 2: Create kanban column**

Create `src/components/activation/kanban-column.tsx`:

```typescript
import SiteCard from './site-card'
import type { Site, SiteActivationMilestone } from '@/types'

interface KanbanColumnProps {
  title: string
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
  stage: string
}

export default function KanbanColumn({ title, sites, stage }: KanbanColumnProps) {
  return (
    <div className="flex flex-col bg-gray-100 rounded-lg p-4 min-w-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-700">{title}</h3>
        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded">
          {sites.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto">
        {sites.map((site) => (
          <SiteCard key={site.id} site={site} currentStage={stage} />
        ))}
        {sites.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No sites</p>
        )}
      </div>
    </div>
  )
}
```

**Step 3: Create kanban board**

Create `src/components/activation/kanban-board.tsx`:

```typescript
import KanbanColumn from './kanban-column'
import type { Site, SiteActivationMilestone, MilestoneType } from '@/types'
import { MILESTONE_ORDER } from '@/types'

interface KanbanBoardProps {
  sites: Array<Site & { milestones: SiteActivationMilestone[] }>
}

type KanbanStage = 'regulatory' | 'contracts' | 'siv' | 'edc' | 'activated'

const stageConfig: Record<KanbanStage, { title: string; milestones: MilestoneType[] }> = {
  regulatory: {
    title: 'Regulatory',
    milestones: ['regulatory_submitted', 'regulatory_approved'],
  },
  contracts: {
    title: 'Contracts',
    milestones: ['contract_sent', 'contract_executed'],
  },
  siv: {
    title: 'SIV',
    milestones: ['siv_scheduled', 'siv_completed'],
  },
  edc: {
    title: 'EDC Training',
    milestones: ['edc_training_complete'],
  },
  activated: {
    title: 'Activated',
    milestones: ['site_activated'],
  },
}

function getSiteStage(site: Site & { milestones: SiteActivationMilestone[] }): KanbanStage {
  // If site is activated, show in activated column
  const activatedMilestone = site.milestones.find(m => m.milestone_type === 'site_activated')
  if (activatedMilestone?.status === 'completed') {
    return 'activated'
  }

  // Find the current stage based on incomplete milestones
  for (const [stage, config] of Object.entries(stageConfig) as [KanbanStage, typeof stageConfig[KanbanStage]][]) {
    const stageMilestones = site.milestones.filter(m =>
      config.milestones.includes(m.milestone_type)
    )
    const hasIncomplete = stageMilestones.some(m => m.status !== 'completed')
    if (hasIncomplete) {
      return stage
    }
  }

  return 'regulatory'
}

export default function KanbanBoard({ sites }: KanbanBoardProps) {
  const sitesByStage: Record<KanbanStage, typeof sites> = {
    regulatory: [],
    contracts: [],
    siv: [],
    edc: [],
    activated: [],
  }

  for (const site of sites) {
    const stage = getSiteStage(site)
    sitesByStage[stage].push(site)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {(Object.entries(stageConfig) as [KanbanStage, typeof stageConfig[KanbanStage]][]).map(
        ([stage, config]) => (
          <KanbanColumn
            key={stage}
            title={config.title}
            sites={sitesByStage[stage]}
            stage={stage}
          />
        )
      )}
    </div>
  )
}
```

**Step 4: Create activation page**

Create `src/app/activation/page.tsx`:

```typescript
import { getAllSitesWithMilestones } from '@/lib/queries/sites'
import { getStudies } from '@/lib/queries/studies'
import KanbanBoard from '@/components/activation/kanban-board'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default async function ActivationPage() {
  const sites = await getAllSitesWithMilestones()
  const studies = await getStudies()

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
```

**Step 5: Verify**

```bash
npm run dev
```

Expected: Activation page shows kanban board with sites organized by milestone stage.

**Step 6: Commit**

```bash
git add src/app/activation/ src/components/activation/
git commit -m "feat: add activation kanban view"
```

---

## Task 13: Final Verification & Cleanup

**Step 1: Run dev server and test full flow**

```bash
npm run dev
```

Test:
1. Create a study
2. Add a site to the study
3. View site detail and update milestones
4. Check activation kanban updates

**Step 2: Run linting**

```bash
npm run lint
```

Fix any lint errors.

**Step 3: Create final commit**

```bash
git add -A
git commit -m "chore: fix lint errors and cleanup"
```

**Step 4: Summary commit**

```bash
git log --oneline -10
```

Expected: Clean commit history showing incremental feature additions.

---

## Post-MVP Notes

After completing Phase 1, the following features are ready for Phase 2:

1. Risk indicators (color coding by days in stage)
2. Filter/search on kanban by study
3. Drag-and-drop milestone updates on kanban
4. Activation timeline visualization
5. Notes display in kanban cards

Refer to `docs/plans/2026-01-27-clinical-trial-dashboard-design.md` for full feature roadmap.
