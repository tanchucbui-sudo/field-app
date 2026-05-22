'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Store, Profile, DailyAssignment } from '@/lib/types'

export default function AssignmentsPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const [stores, setStores] = useState<Store[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [assignments, setAssignments] = useState<DailyAssignment[]>([])
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [selStore, setSelStore] = useState('')
  const [selUser, setSelUser] = useState('')
  const supabase = createClient()

  async function load() {
    const [{ data: s }, { data: u }, { data: a }] = await Promise.all([
      supabase.from('stores').select('*').eq('project_id', projectId).order('name'),
      supabase.from('project_members').select('profiles(*)').eq('project_id', projectId),
      supabase.from('daily_assignments').select('*, store:stores(*), profile:profiles(*)').eq('project_id', projectId).eq('assigned_date', date)
    ])
    setStores(s ?? [])
    setUsers((u ?? []).map((m: any) => m.profiles).filter(Boolean))
    setAssignments(a ?? [])
  }

  useEffect(() => { load() }, [date])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('daily_assignments').insert({ project_id: projectId, store_id: selStore, user_id: selUser, assigned_date: date })
    setSelStore(''); setSelUser(''); setShowForm(false); load()
  }

  async function handleDelete(id: string) {
    await supabase.from('daily_assignments').delete().eq('id', id); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/admin/projects/${projectId}`} className="text-blue-600 text-sm hover:underline">← Dự án</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">📅 Phân công</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          + Thêm phân công
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Ngày:</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <span className="text-sm text-gray-500">{assignments.length} phân công</span>
      </div>

      <div className="space-y-3">
        {assignments.length === 0 && <p className="text-gray-500 text-center py-12 bg-white rounded-2xl border">Không có phân công nào cho ngày này.</p>}
        {assignments.map(a => (
          <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-medium">🏪 {(a as any).store?.name}</div>
              <div className="text-sm text-gray-500">👤 {(a as any).profile?.full_name ?? (a as any).profile?.email}</div>
            </div>
            <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-lg mb-4">Thêm phân công ngày {date}</h2>
            {users.length === 0 ? (
              <p className="text-orange-600 text-sm bg-orange-50 p-3 rounded-lg mb-4">
                ⚠️ Chưa có nhân viên nào trong dự án. Vào mục Nhân viên để thêm trước.
              </p>
            ) : null}
            <form onSubmit={handleCreate} className="space-y-3">
              <select value={selStore} onChange={e => setSelStore(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Chọn cửa hàng --</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={selUser} onChange={e => setSelUser(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="">-- Chọn nhân viên --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name ?? u.email}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium">Thêm</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 py-2.5 rounded-xl font-medium">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
