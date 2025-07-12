import LoginForm from '@/components/login-form'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  return (
    <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-tr from-sky-50 to-blue-100 py-8 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-2xl ring-1 ring-gray-100 p-8 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-700 p-4 shadow-lg mb-2">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">เข้าสู่ระบบ</h1>
          <p className="text-gray-500">เข้าสู่ระบบเพื่อจัดการงานของสภานักเรียน</p>
        </div>
        <LoginForm />
      </div>
    </section>
  )
} 