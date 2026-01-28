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
