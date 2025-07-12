import { Metadata } from 'next'
import TasksTable from '@/components/tasks-table'
import { ClipboardList } from 'lucide-react'

export const metadata: Metadata = {
  title: 'ตารางงาน - ระบบติดตามงานสภานักเรียน',
  description: 'ดูและจัดการงานของสภานักเรียน',
}

export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-none py-8 px-2 md:px-0">
      <div className="mb-8 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-700 p-4 shadow-lg">
          <ClipboardList className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">ตารางงาน</h1>
        <p className="text-lg text-gray-500">ติดตามและจัดการงานของสภานักเรียนได้อย่างง่ายดาย</p>
      </div>
      <div className="w-full max-w-full md:max-w-none rounded-2xl bg-white/80 shadow-xl ring-1 ring-gray-100 p-2 md:p-4">
        <TasksTable />
      </div>
    </section>
  )
}