import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Task = {
  id: string
  created_at: string
  title: string
  assigned_department: string
  signup_date: string
  start_date: string
  due_date: string
  status: 'เสร็จสิ้น' | 'กำลังดำเนิน' | 'ยังไม่ดำเนินงาน'
}

export type Department = 'วิชาการ' | 'งบประมาณ' | 'กิจกรรม' | 'ประชาสัมพันธ์' | 'วินัย' 