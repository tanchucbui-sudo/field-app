'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Form, FormField, FieldType } from '@/lib/types'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: '📝 Văn bản' },
  { value: 'number', label: '🔢 Số' },
  { value: 'textarea', label: '📄 Đoạn văn' },
  { value: 'select', label: '📋 Chọn từ danh sách' },
  { value: 'photo', label: '📷 Hình ảnh' },
  { value: 'gps', label: '📍 Định vị GPS' },
  { value: 'date', label: '📅 Ngày tháng' },
]

export default function FormsPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const [form, setForm] = useState<Form | null>(null)
  const [fields, setFields] = useState<FormField[]>([])
  const [showAddField, setShowAddField] = useState(false)
  const [fieldLabel, setFieldLabel] = useState('')
  const [fieldType, setFieldType] = useState<FieldType>('text')
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldOptions, setFieldOptions] = useState('')
  const supabase = createClient()

  async function load() {
    let { data: formData } = await supabase.from('forms').select('*').eq('project_id', projectId).single()
    if (!formData) {
      const { data: newForm } = await supabase.from('forms').insert({ project_id: projectId, name: 'Form khảo sát' }).select().single()
      formData = newForm
    }
    setForm(formData)
    if (formData) {
      const { data: fieldsData } = await supabase.from('form_fields').select('*').eq('form_id', formData.id).order('sort_order')
      setFields(fieldsData ?? [])
    }
  }

  useEffect(() => { load() }, [projectId])

  async function addField(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    const options = fieldType === 'select' ? fieldOptions.split('\n').filter(Boolean) : null
    await supabase.from('form_fields').insert({
      form_id: form.id, label: fieldLabel, field_type: fieldType,
      is_required: fieldRequired, options, sort_order: fields.length
    })
    setFieldLabel(''); setFieldType('text'); setFieldRequired(false); setFieldOptions(''); setShowAddField(false)
    load()
  }

  async function deleteField(fieldId: string) {
    if (!confirm('Xóa trường này?')) return
    await supabase.from('form_fields').delete().eq('id', fieldId)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/admin/projects/${projectId}`} className="text-blue-600 text-sm hover:underline">← Dự án</Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">📝 Form câu hỏi</h1>
        </div>
        <button onClick={() => setShowAddField(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700">
          + Thêm trường
        </button>
      </div>

      <div className="space-y-3">
        {fields.length === 0 && <p className="text-gray-500 text-center py-12 bg-white rounded-2xl border">Chưa có trường nào. Thêm trường đầu tiên!</p>}
        {fields.map((f, i) => (
          <div key={f.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">#{i+1}</span>
                <span className="font-medium">{f.label}</span>
                {f.is_required && <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Bắt buộc</span>}
              </div>
              <span className="text-sm text-gray-500">{FIELD_TYPES.find(t => t.value === f.field_type)?.label}</span>
              {f.options && <span className="text-xs text-gray-400 ml-2">({f.options.join(', ')})</span>}
            </div>
            <button onClick={() => deleteField(f.id)} className="text-red-400 hover:text-red-600 text-sm px-2">🗑️</button>
          </div>
        ))}
      </div>

      {showAddField && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg mb-4">Thêm trường mới</h2>
            <form onSubmit={addField} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Tên trường *</label>
                <input value={fieldLabel} onChange={e => setFieldLabel(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Doanh số tháng này" required />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Loại dữ liệu</label>
                <select value={fieldType} onChange={e => setFieldType(e.target.value as FieldType)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {fieldType === 'select' && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Các lựa chọn (mỗi dòng 1 lựa chọn)</label>
                  <textarea value={fieldOptions} onChange={e => setFieldOptions(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4} placeholder={"Tốt\nBình thường\nKém"} />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={fieldRequired} onChange={e => setFieldRequired(e.target.checked)} className="w-4 h-4" />
                <span className="text-sm text-gray-700">Bắt buộc nhập</span>
              </label>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700">Thêm</button>
                <button type="button" onClick={() => setShowAddField(false)} className="flex-1 border border-gray-300 py-2.5 rounded-xl font-medium">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
