// src/app/login/page.tsx
'use client'

import LoginForm from '@/components/login-form'
import { LogIn } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoginPage() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-tr from-sky-50 to-blue-100 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl ring-1 ring-gray-200/50 p-8 flex flex-col items-center"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-700 p-4 shadow-lg mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            เข้าสู่ระบบ
          </h1>
          <p className="text-gray-500 mt-1">
            จัดการงานของสภานักเรียนได้อย่างง่ายดาย
          </p>
        </div>
        <LoginForm />
      </motion.div>
    </section>
  )
}