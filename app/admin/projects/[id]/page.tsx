'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { Project } from '@/lib/types'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => setProject(data))
  }, [id])

  const tabs = [
    { href: `/admin/projects/${id}/forms`, label: '📝 Form câu hỏi' },
    { href: `/admin/projects/${id}/stores`, label: '🏪 Cửa hàng' },
    { href: `/admin/projects/${id}/assignments`, label: '📅 Phân công' },
  ]

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/projects" className="text-blue-600 text-sm hover:underline">← Dự án</Link>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">{project?.name ?? '...'}</h1>
        {project?.description && <p className="text-gray-500 text-sm mt-1">{project.description}</p>}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {tabs.map(t => (
          <Link key={t.href} href={t.href}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition text-center font-medium text-gray-700">
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
