'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { DailyAssignment } from '@/lib/types'

export default function FieldHome() {
  const [assignments, setAssignments] = useState<DailyAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const today = new Date().toISOString().split('T')[0]
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('full_name,email').eq('id', user.id).single()
      setUserName(profile?.full_name ?? profile?.email ?? '')

      const { data } = await supabase
        .from('daily_assignments')
        .select('*, store:stores(*), project:projects(*)')
        .eq('user_id', user.id)
        .eq('assigned_date', today)
      setAssignments(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const todayVN = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-500 text-sm">{todayVN}</p>
        <h1 className="text-xl font-bold text-gray-800">Xin chào, {userName} 👋</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <div className="font-semibold text-blue-800">📅 Hôm nay cần thăm</div>
        <div className="text-3xl font-bold text-blue-600 mt-1">{loading ? '...' : assignments.length} cửa hàng</div>
      </div>

      {loading ? <p className="text-gray-400 text-center py-8">Đang tải...</p> : (
        <div className="space-y-3">
          {assignments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500">Không có lịch thăm hôm nay</p>
            </div>
          )}
          {assignments.map(a => (
            <Link key={a.id} href={`/field/submit/${a.id}`}
              className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{(a as any).store?.name}</div>
                  {(a as any).store?.address && <div className="text-sm text-gray-500 mt-0.5">📍 {(a as any).store.address}</div>}
                  <div className="text-xs text-gray-400 mt-1">{(a as any).project?.name}</div>
                </div>
                <span className="text-blue-500 text-xl">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
