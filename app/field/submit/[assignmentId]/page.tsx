'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import type { FormField } from '@/lib/types'

export default function SubmitPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()
  const [assignment, setAssignment] = useState<any>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [values, setValues] = useState<Record<string, any>>({})
  const [photos, setPhotos] = useState<Record<string, File>>({})
  const [gps, setGps] = useState<{lat:number,lng:number}|null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: a } = await supabase
        .from('daily_assignments')
        .select('*, store:stores(*), project:projects(*)')
        .eq('id', assignmentId).single()
      setAssignment(a)
      if (a) {
        const { data: form } = await supabase.from('forms').select('*').eq('project_id', a.project_id).single()
        if (form) {
          const { data: f } = await supabase.from('form_fields').select('*').eq('form_id', form.id).order('sort_order')
          setFields(f ?? [])
        }
      }
      // Auto-get GPS
      navigator.geolocation?.getCurrentPosition(p => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }))
      setLoading(false)
    }
    load()
  }, [assignmentId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !assignment) return

    // Create submission
    const { data: submission } = await supabase.from('submissions').insert({
      assignment_id: assignmentId,
      form_id: fields[0]?.form_id,
      user_id: user.id,
      store_id: assignment.store_id,
      gps_lat: gps?.lat ?? null,
      gps_lng: gps?.lng ?? null,
      notes: values['__notes'] ?? null
    }).select().single()
    if (!submission) { setSubmitting(false); return }

    // Save field values
    const valueRows = fields
      .filter(f => f.field_type !== 'photo' && f.field_type !== 'gps' && values[f.id] !== undefined)
      .map(f => ({
        submission_id: submission.id,
        field_id: f.id,
        value_text: ['text','textarea','select'].includes(f.field_type) ? String(values[f.id]) : null,
        value_number: f.field_type === 'number' ? Number(values[f.id]) : null,
        value_date: f.field_type === 'date' ? String(values[f.id]) : null,
      }))
    if (valueRows.length > 0) await supabase.from('submission_values').insert(valueRows)

    // Upload photos
    for (const [fieldId, file] of Object.entries(photos)) {
      const path = `${user.id}/${submission.id}/${fieldId}_${file.name}`
      const { error } = await supabase.storage.from('photos').upload(path, file)
      if (!error) await supabase.from('submission_photos').insert({ submission_id: submission.id, field_id: fieldId, storage_path: path })
    }

    setSubmitted(true)
    setSubmitting(false)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Đang tải...</div>
  if (submitted) return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">✅</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Đã gửi thành công!</h2>
      <p className="text-gray-500 mb-6">{assignment?.store?.name}</p>
      <button onClick={() => router.push('/field')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium">Về trang chủ</button>
    </div>
  )

  return (
    <div>
      <button onClick={() => router.back()} className="text-blue-600 text-sm mb-4">← Quay lại</button>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
        <h1 className="text-lg font-bold text-gray-800">{assignment?.store?.name}</h1>
        {assignment?.store?.address && <p className="text-sm text-gray-500">📍 {assignment.store.address}</p>}
        {gps && <p className="text-xs text-green-600 mt-1">✅ GPS: {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}</p>}
        {!gps && <p className="text-xs text-orange-500 mt-1">⏳ Đang lấy vị trí GPS...</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(f => (
          <div key={f.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {f.label} {f.is_required && <span className="text-red-500">*</span>}
            </label>
            {f.field_type === 'text' && (
              <input value={values[f.id]??''} onChange={e => setValues(v=>({...v,[f.id]:e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={f.is_required} />
            )}
            {f.field_type === 'textarea' && (
              <textarea value={values[f.id]??''} onChange={e => setValues(v=>({...v,[f.id]:e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3}
                required={f.is_required} />
            )}
            {f.field_type === 'number' && (
              <input type="number" value={values[f.id]??''} onChange={e => setValues(v=>({...v,[f.id]:e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={f.is_required} />
            )}
            {f.field_type === 'date' && (
              <input type="date" value={values[f.id]??''} onChange={e => setValues(v=>({...v,[f.id]:e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={f.is_required} />
            )}
            {f.field_type === 'select' && (
              <select value={values[f.id]??''} onChange={e => setValues(v=>({...v,[f.id]:e.target.value}))}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={f.is_required}>
                <option value="">-- Chọn --</option>
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            )}
            {f.field_type === 'gps' && (
              <p className="text-sm text-green-600">{gps ? `✅ ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : '⏳ Đang lấy GPS...'}</p>
            )}
            {f.field_type === 'photo' && (
              <div>
                <input type="file" accept="image/*" capture="environment"
                  onChange={e => { if(e.target.files?.[0]) setPhotos(p=>({...p,[f.id]:e.target.files![0]})) }}
                  className="w-full text-sm text-gray-500" required={f.is_required} />
                {photos[f.id] && <p className="text-xs text-green-600 mt-1">✅ {photos[f.id].name}</p>}
              </div>
            )}
          </div>
        ))}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú thêm</label>
          <textarea value={values['__notes']??''} onChange={e => setValues(v=>({...v,'__notes':e.target.value}))}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2}
            placeholder="Ghi chú..." />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg">
          {submitting ? '⏳ Đang gửi...' : '✅ Gửi báo cáo'}
        </button>
      </form>
    </div>
  )
}
