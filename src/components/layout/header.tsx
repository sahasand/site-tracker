import Link from 'next/link'
import Nav from './nav'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/80">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-slate-800 tracking-tight" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
              Site Tracker
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium -mt-0.5">
              Clinical Trial Management
            </span>
          </div>
        </Link>
        <Nav />
      </div>
    </header>
  )
}
