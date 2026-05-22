'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Project } from '@/lib/types'

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin'|'field_user'>('field_user')
  const [selProject, setSelProject] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const supabase = createClient()

  async function load() {
    const [{ data: u }, { data: p }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').eq('is_active', true)
    ])
    setUsers(u ?? [])
    setProjects(p ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setMsg('')
    const res = await fetch('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName, role, project_id: selProject || null })
    })
    const data = await res.json()
    if (data.error) { setMsg('Lỗi: ' + data.error); setLoading(false); return }
    setMsg('Tạo tài khoản thành công!')
    setEmail(''); setFullName(''); setPassword(''); setRole('field_user'); setSelProject('')
    setShowForm(false); setLoading(false); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 Nhân viên</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          + Tạo tài khoản
        </button>
      </div>

      {msg && <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-xl text-sm">{msg}</div>}

      <div className="grid gap-3">
        {users.length === 0 && <p className="text-gray-500 text-center py-12 bg-white rounded-2xl border">Chưa có nhân viên nào.</p>}
        {users.map(u => (
          <div key={u.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-medium">{u.full_name ?? u.email}</div>
              <div className="text-sm text-gray-500">{u.email}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
              {u.role === 'admin' ? '⚙️ Admin' : '👤 Field User'}
            </span>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">Tạo tài khoản mới</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Họ tên *"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email *"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mật khẩu *"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required minLength={6} />
              <select value={role} onChange={e => setRole(e.target.value as any)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="field_user">👤 Field User</option>
                <option value="admin">⚙️ Admin</option>
              </select>
              {role === 'field_user' && (
                <select value={selProject} onChange={e => setSelProject(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">-- Gán vào dự án (tùy chọn) --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium disabled:opacity-50">
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 py-2.5 rounded-xl font-medium">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
