'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function FieldLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  async function handleLogout() {
    await supabase.auth.signOut(); router.push('/login')
  }
  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/field" className="font-bold text-blue-600">📋 Field App</Link>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">Đăng xuất</button>
      </nav>
      <main className="px-4 py-6">{children}</main>
    </div>
  )
}
