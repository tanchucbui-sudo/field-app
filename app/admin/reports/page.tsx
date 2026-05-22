'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReportsPage() {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 7*86400000).toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('submissions')
      .select('*, store:stores(name), profile:profiles(full_name,email), values:submission_values(*, field:form_fields(label,field_type)), photos:submission_photos(*)')
      .gte('submitted_at', dateFrom + 'T00:00:00')
      .lte('submitted_at', dateTo + 'T23:59:59')
      .order('submitted_at', { ascending: false })
    setSubmissions(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function exportExcel() {
    const { utils, writeFile } = await import('xlsx')
    const rows = submissions.map(s => {
      const row: any = {
        'Ngày': new Date(s.submitted_at).toLocaleString('vi-VN'),
        'Nhân viên': s.profile?.full_name ?? s.profile?.email,
        'Cửa hàng': s.store?.name,
        'GPS': s.gps_lat ? `${s.gps_lat},${s.gps_lng}` : '',
        'Ghi chú': s.notes ?? '',
      }
      s.values?.forEach((v: any) => {
        row[v.field?.label ?? v.field_id] = v.value_text ?? v.value_number ?? v.value_date ?? ''
      })
      row['Số ảnh'] = s.photos?.length ?? 0
      return row
    })
    const ws = utils.json_to_sheet(rows)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Báo cáo')
    writeFile(wb, `baocao_${dateFrom}_${dateTo}.xlsx`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Báo cáo</h1>
        <button onClick={exportExcel} disabled={submissions.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-40">
          📥 Xuất Excel
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4 flex items-center gap-3 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Từ:</label>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <label className="text-sm font-medium text-gray-700">Đến:</label>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700">Lọc</button>
        <span className="text-sm text-gray-500">{loading ? 'Đang tải...' : `${submissions.length} kết quả`}</span>
      </div>

      <div className="space-y-3">
        {!loading && submissions.length === 0 && <p className="text-gray-500 text-center py-12 bg-white rounded-2xl border">Không có dữ liệu.</p>}
        {submissions.map(s => (
          <div key={s.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold">{s.store?.name}</div>
                <div className="text-sm text-gray-500">👤 {s.profile?.full_name ?? s.profile?.email} · {new Date(s.submitted_at).toLocaleString('vi-VN')}</div>
                {s.gps_lat && <div className="text-xs text-gray-400 mt-0.5">📍 {s.gps_lat.toFixed(5)}, {s.gps_lng?.toFixed(5)}</div>}
              </div>
              {s.photos?.length > 0 && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">📷 {s.photos.length} ảnh</span>}
            </div>
            {s.values?.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {s.values.map((v: any) => (
                  <div key={v.id} className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-500">{v.field?.label}</div>
                    <div className="text-sm font-medium">{v.value_text ?? v.value_number ?? v.value_date ?? '—'}</div>
                  </div>
                ))}
              </div>
            )}
            {s.notes && <div className="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg">📝 {s.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
