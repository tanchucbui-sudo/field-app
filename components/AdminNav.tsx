'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: '🏠 Dashboard', exact: true },
  { href: '/admin/projects', label: '📁 Dự án' },
  { href: '/admin/users', label: '👥 Nhân viên' },
  { href: '/admin/reports', label: '📊 Báo cáo' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-1">
        <span className="font-bold text-blue-600 mr-4">📋 Field App</span>
        {navItems.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              {item.label}
            </Link>
          )
        })}
      </div>
      <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition">Đăng xuất</button>
    </nav>
  )
}
