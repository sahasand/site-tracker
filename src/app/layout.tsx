import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import Providers from './providers'
import Header from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Site Tracker | Clinical Trial Management',
  description: 'Professional clinical trial site tracking and activation management dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen page-bg">
            <Header />
            <main className="container mx-auto px-6 py-8">
              {children}
            </main>
          </div>
          <Toaster position="bottom-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
