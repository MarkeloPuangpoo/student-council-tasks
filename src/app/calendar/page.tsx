import { Metadata } from 'next'
import CalendarView from '@/components/calendar-view'
import { Calendar as CalendarIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ปฏิทินงาน - ระบบติดตามงานสภานักเรียน',
  description: 'ดูงานของสภานักเรียนในรูปแบบปฏิทิน',
}

export default function CalendarPage() {
  return (
    <section className="mx-auto max-w-5xl py-8 px-4">
      <div className="mb-8 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-700 p-4 shadow-lg">
          <CalendarIcon className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">ปฏิทินกิจกรรม</h1>
        <p className="text-lg text-gray-500">ติดตามกิจกรรมและงานสำคัญของสภานักเรียนในรูปแบบปฏิทินที่ใช้งานง่าย</p>
      </div>
      <div className="rounded-2xl bg-white/80 shadow-xl ring-1 ring-gray-100 p-4 md:p-8">
        <CalendarView />
      </div>
    </section>
  )
} 