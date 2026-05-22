'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Store } from '@/lib/types'

export default function StoresPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const [stores, setStores] = useState<Store[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const supabase = createClient()

  async function load() {
    const { data } = await supabase.from('stores').select('*').eq('project_id', projectId).order('name')
    setStores(data ?? [])
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('stores').insert({ project_id: projectId, name, address })
    setName(''); setAddress(''); setShowForm(false); load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Xóa cửa hàng này?')) return
    await supabase.from('stores').delete().eq('id', id); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/admin/projects/${projectId}`} className="text-blue-600 text-sm hover:underline">← Dự án</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">🏪 Cửa hàng</h1>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          + Thêm cửa hàng
        </button>
      </div>

      <div className="grid gap-3">
        {stores.length === 0 && <p className="text-gray-500 text-center py-12 bg-white rounded-2xl border">Chưa có cửa hàng nào.</p>}
        {stores.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="font-medium">{s.name}</div>
              {s.address && <div className="text-sm text-gray-500">📍 {s.address}</div>}
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 text-sm">🗑️</button>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="font-bold text-lg mb-4">Thêm cửa hàng</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên cửa hàng *"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
