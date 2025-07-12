'use client'; // <--- เพิ่มบรรทัดนี้เข้ามา

import TasksTable from '@/components/tasks-table'
import { ClipboardList } from 'lucide-react'
import { motion } from 'framer-motion'

// หมายเหตุ: เมื่อใช้ 'use client', เราไม่สามารถ export metadata โดยตรงได้
// หากต้องการ SEO ที่ดี ควรให้ metadata อยู่ใน Server Component หรือ layout.tsx
/*
export const metadata: Metadata = {
  title: 'ตารางงาน - ระบบติดตามงานสภานักเรียน',
  description: 'ดูและจัดการงานของสภานักเรียน',
}
*/

export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-7xl py-8 px-4">
      <motion.div
        className="mb-8 flex flex-col items-center justify-center gap-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-blue-700 p-5 shadow-xl">
          <ClipboardList className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">ตารางงาน</h1>
          <p className="mt-2 text-lg text-gray-600">ติดตามและจัดการงานของสภานักเรียนได้อย่างง่ายดาย</p>
        </div>
      </motion.div>

      <motion.div
        className="w-full rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl ring-1 ring-gray-200/50 p-4 md:p-6"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <TasksTable />
      </motion.div>
    </section>
  )
}