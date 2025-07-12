'use client' // <--- เพิ่มบรรทัดนี้เข้ามาครับ

import CalendarView from '@/components/calendar-view'
import { Calendar as CalendarIcon } from 'lucide-react'
import { motion } from 'framer-motion'

// หมายเหตุ: เมื่อใช้ 'use client', เราไม่สามารถ export metadata โดยตรงได้
// Next.js จะไม่อ่านค่า metadata จาก Client Component
// หากต้องการ metadata แบบไดนามิกในหน้านี้ จะต้องใช้วิธีอื่น แต่สำหรับตอนนี้ metadata แบบ static จะยังคงใช้งานได้จาก layout หลัก
/*
export const metadata: Metadata = {
  title: 'ปฏิทินงาน - ระบบติดตามงานสภานักเรียน',
  description: 'ดูงานของสภานักเรียนในรูปแบบปฏิทิน',
}
*/

export default function CalendarPage() {
  return (
    <section className="mx-auto w-full max-w-7xl py-8 px-4">
      {/* Header */}
      <motion.div
        className="mb-8 flex flex-col items-center justify-center gap-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-blue-700 p-5 shadow-xl">
          <CalendarIcon className="h-10 w-10 text-white" />
        </div>
        <div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            ปฏิทินกิจกรรม
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            ติดตามกิจกรรมและงานสำคัญของสภานักเรียนในรูปแบบปฏิทินที่ใช้งานง่าย
          </p>
        </div>
      </motion.div>

      {/* Container สำหรับ CalendarView */}
      <motion.div
        className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl ring-1 ring-gray-200/50 p-4 md:p-6"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <CalendarView />
      </motion.div>
    </section>
  )
}