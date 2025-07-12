'use client'

import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { X, Loader2, AlertCircle, PlusCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { UseFormRegister, FieldError } from 'react-hook-form'

// --- Constants and Schema ---

const DEPARTMENTS = ['วิชาการ', 'งบประมาณ', 'กิจการนักเรียน', 'ทั่วไป', 'บุคคล', 'สำนักประธานสภานักเรียน'] as const;
const STATUSES = ['ยังไม่ดำเนินงาน', 'กำลังดำเนิน', 'เสร็จสิ้น'] as const;

const taskSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่องาน'),
  assigned_department: z.enum(DEPARTMENTS, { required_error: 'กรุณาเลือกฝ่าย' }),
  signup_date: z.string().min(1, 'กรุณาเลือกวันที่รับสมัคร'),
  start_date: z.string().min(1, 'กรุณาเลือกวันที่เริ่มงาน'),
  due_date: z.string().min(1, 'กรุณาเลือกวันที่สิ้นสุด'),
  status: z.enum(STATUSES, { required_error: 'กรุณาเลือกสถานะ' }),
})

type TaskFormData = z.infer<typeof taskSchema>

// --- Props and Reusable Components ---

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormFieldProps {
    id: keyof TaskFormData;
    label: string;
    type?: string;
    placeholder?: string;
    register: UseFormRegister<TaskFormData>;
    error: FieldError | undefined;
    options?: readonly string[];
    icon?: React.ReactNode;
}
  
const FormField: FC<FormFieldProps> = ({ id, label, type = 'text', placeholder, register, error, options, icon }) => (
    <div className="space-y-2">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
        </label>
        <div className="relative">
            {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400">{icon}</div>}
            {type === 'select' ? (
                <select
                    id={id}
                    {...register(id)}
                    className={cn("w-full appearance-none rounded-xl border bg-white px-4 py-2.5 transition-colors", 
                                 icon ? 'pl-10' : 'pl-4',
                                 error ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200')}
                >
                    <option value="">เลือก{label}</option>
                    {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    id={id}
                    {...register(id)}
                    placeholder={placeholder}
                    className={cn("w-full rounded-xl border bg-white px-4 py-2.5 transition-colors",
                                 icon ? 'pl-10' : 'pl-4',
                                 error ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200')}
                />
            )}
        </div>
        {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
);


// --- Main Modal Component ---

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      assigned_department: undefined,
      signup_date: '',
      start_date: '',
      due_date: '',
      status: 'ยังไม่ดำเนินงาน',
    },
  })

  const { mutate: addTask, error: mutationError } = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const { error } = await supabase.from('tasks').insert([{ ...data }]);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      reset();
      onClose();
    },
    onError: (error) => {
        console.error('Error adding task:', error);
    }
  });

  const onSubmit = (data: TaskFormData) => {
    addTask(data);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 bg-sky-100 p-3 rounded-full">
                    <PlusCircle className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">เพิ่มงานใหม่</h2>
                    <p className="text-sm text-gray-500">กรอกข้อมูลเพื่อสร้างงานใหม่ในระบบ</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {mutationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <p className="text-sm text-red-600">เกิดข้อผิดพลาด: {mutationError.message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField id="title" label="ชื่องาน" register={register} error={errors.title} placeholder="ชื่องานหรือกิจกรรม" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField id="assigned_department" label="ฝ่ายรับผิดชอบ" type="select" options={DEPARTMENTS} register={register} error={errors.assigned_department} />
                <FormField id="status" label="สถานะ" type="select" options={STATUSES} register={register} error={errors.status} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField id="signup_date" label="วันที่รับสมัคร" type="date" register={register} error={errors.signup_date} />
                <FormField id="start_date" label="วันที่เริ่มงาน" type="date" register={register} error={errors.start_date} />
                <FormField id="due_date" label="วันที่สิ้นสุด" type="date" register={register} error={errors.due_date} />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="px-6 rounded-lg">
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isSubmitting} className="px-6 bg-sky-500 hover:bg-sky-600 text-white rounded-lg">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    'บันทึก'
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}