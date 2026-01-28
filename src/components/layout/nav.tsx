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
