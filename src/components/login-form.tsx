// src/components/login-form.tsx
'use client'

import { useState, FC } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, UseFormRegister, FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// --- Schema for Validation ---
const loginSchema = z.object({
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
})

type LoginFormData = z.infer<typeof loginSchema>

// --- Reusable Input Field Component ---
interface InputFieldProps {
  id: keyof LoginFormData;
  label: string;
  type: string;
  placeholder: string;
  register: UseFormRegister<LoginFormData>;
  error: FieldError | undefined;
  icon: React.ReactNode;
  toggleVisibility?: () => void;
  isPasswordVisible?: boolean;
}

const InputField: FC<InputFieldProps> = (props: InputFieldProps) => {
  const { id, label, type, placeholder, register, error, icon, toggleVisibility, isPasswordVisible } = props;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          {icon}
        </div>
        <input
          id={id}
          type={type}
          {...register(id)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors focus:outline-none focus:ring-2",
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-300 focus:border-sky-500 focus:ring-sky-200'
          )}
        />
        {id === 'password' && (
          <button type="button" onClick={toggleVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700">
            {isPasswordVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>
      <AnimatePresence>
          {error && (
              <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-red-600 flex items-center gap-1"
              >
                  <AlertCircle className="h-3.5 w-3.5"/>
                  {error.message}
              </motion.p>
          )}
      </AnimatePresence>
    </div>
  );
}

// --- Main Login Form Component ---
export default function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const { mutate: signIn, isPending, error: mutationError } = useMutation({
    mutationFn: async ({ email, password }: LoginFormData) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            if (error.message === 'Invalid login credentials') {
                throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            }
            throw new Error('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
        }
    },
    onSuccess: () => {
        router.push('/');
        router.refresh(); // To update server-side state like user in Navbar
    }
  });

  return (
    <form onSubmit={handleSubmit(data => signIn(data))} className="w-full space-y-5">
      <InputField
        id="email"
        label="อีเมล"
        type="email"
        placeholder="your@email.com"
        register={register}
        error={errors.email}
        icon={<Mail className="h-5 w-5" />}
      />
      <InputField
        id="password"
        label="รหัสผ่าน"
        type={showPassword ? 'text' : 'password'}
        placeholder="••••••••"
        register={register}
        error={errors.password}
        icon={<Lock className="h-5 w-5" />}
        toggleVisibility={() => setShowPassword(!showPassword)}
        isPasswordVisible={showPassword}
      />

      <AnimatePresence>
        {mutationError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 text-red-700 text-sm rounded-lg p-3 flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5" />
            {mutationError.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        className="w-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-102"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            กำลังเข้าสู่ระบบ...
          </>
        ) : (
          'เข้าสู่ระบบ'
        )}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          ต้องการความช่วยเหลือ?{' '}
          <a href="#" className="text-sky-600 hover:text-sky-700 font-medium hover:underline">
            ติดต่อผู้ดูแลระบบ
          </a>
        </p>
      </div>
    </form>
  )
}