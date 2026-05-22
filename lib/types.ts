export type UserRole = 'admin' | 'field_user'
export type FieldType = 'text' | 'number' | 'photo' | 'gps' | 'select' | 'date' | 'textarea'

export interface Profile {
  id: string; full_name: string; email: string; role: UserRole; created_at: string
}
export interface Project {
  id: string; name: string; description: string; is_active: boolean; created_at: string
}
export interface Form {
  id: string; project_id: string; name: string; description: string; created_at: string
}
export interface FormField {
  id: string; form_id: string; label: string; field_type: FieldType
  is_required: boolean; options: string[] | null; sort_order: number
}
export interface Store {
  id: string; project_id: string; name: string; address: string
}
export interface DailyAssignment {
  id: string; project_id: string; user_id: string; store_id: string
  assigned_date: string; created_at: string
  store?: Store; profile?: Profile; project?: Project
}
export interface Submission {
  id: string; assignment_id: string; form_id: string; user_id: string
  store_id: string; gps_lat: number | null; gps_lng: number | null
  notes: string; submitted_at: string
  store?: Store; profile?: Profile; values?: SubmissionValue[]; photos?: SubmissionPhoto[]
}
export interface SubmissionValue {
  id: string; submission_id: string; field_id: string
  value_text: string | null; value_number: number | null; value_date: string | null
  field?: FormField
}
export interface SubmissionPhoto {
  id: string; submission_id: string; field_id: string; storage_path: string
}
