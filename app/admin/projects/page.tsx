'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { Project } from '@/lib/types'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('projects').insert({ name, description })
    setName(''); setDescription(''); setShowForm(false)
    load()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('projects').update({ is_active: !current }).eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dự án</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
          + Tạo dự án
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-lg mb-4">Tạo dự án mới</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên dự án *"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Mô tả"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700">Tạo</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-300 py-2.5 rounded-xl font-medium hover:bg-gray-50">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p className="text-gray-500">Đang tải...</p> : (
        <div className="grid gap-4">
          {projects.length === 0 && <p className="text-gray-500 text-center py-12">Chưa có dự án nào. Tạo dự án đầu tiên!</p>}
          {projects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
                {p.description && <p className="text-sm text-gray-500 mt-1">{p.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(p.id, p.is_active)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border rounded-lg">
                  {p.is_active ? 'Dừng' : 'Kích hoạt'}
                </button>
                <Link href={`/admin/projects/${p.id}`} className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-medium">
                  Quản lý →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
