import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
  const supabase = createClient()
  const [{ count: projects }, { count: users }, { count: submissions }, { count: stores }] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'field_user'),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase.from('stores').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Dự án', value: projects ?? 0, icon: '📁', color: 'blue' },
    { label: 'Nhân viên', value: users ?? 0, icon: '👥', color: 'green' },
    { label: 'Cửa hàng', value: stores ?? 0, icon: '🏪', color: 'orange' },
    { label: 'Lượt khảo sát', value: submissions ?? 0, icon: '📝', color: 'purple' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-700 mb-3">Bắt đầu nhanh</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>1. Tạo <strong>Dự án</strong> mới trong mục Dự án</p>
          <p>2. Thêm <strong>Form câu hỏi</strong> và định nghĩa các trường dữ liệu</p>
          <p>3. Thêm <strong>Cửa hàng</strong> vào dự án</p>
          <p>4. Tạo <strong>Nhân viên</strong> và phân công cửa hàng theo ngày</p>
          <p>5. Nhân viên đăng nhập app và bắt đầu khảo sát!</p>
        </div>
      </div>
    </div>
  )
}
