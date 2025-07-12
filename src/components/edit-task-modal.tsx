'use client'

import { useEffect, FC } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { X, Loader2, AlertCircle, Pencil } from 'lucide-react'
import { Task } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { UseFormRegister, FieldError } from 'react-hook-form'

// --- Constants and Schema ---

const DEPARTMENTS = ['วิชาการ', 'งบประมาณ', 'กิจการนักเรียน', 'ทั่วไป', 'บุคคล', 'สำนักประธานสภานักเรียน'] as const;
const STATUSES = ['ยังไม่ดำเนินงาน', 'กำลังดำเนิน', 'เสร็จสิ้น'] as const;

const taskSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่องาน'),
  assigned_department: z.enum(DEPARTMENTS, { required_error: 'กรุณาเลือกฝ่ายรับผิดชอบ' }),
  signup_date: z.string().min(1, 'กรุณาเลือกวันที่รับสมัคร'),
  start_date: z.string().min(1, 'กรุณาเลือกวันที่เริ่มกิจกรรม'),
  due_date: z.string().min(1, 'กรุณาเลือกวันที่ส่งงาน'),
  status: z.enum(STATUSES, { required_error: 'กรุณาเลือกสถานะ' }),
})

type TaskFormData = z.infer<typeof taskSchema>

// --- Props Interface ---
interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
}

// --- Reusable Form Field Component ---
interface FormFieldProps {
  id: keyof TaskFormData;
  label: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<TaskFormData>;
  error: FieldError | undefined;
  options?: readonly string[];
}

const FormField: FC<FormFieldProps> = (props: FormFieldProps) => {
  const { id, label, type = 'text', placeholder, register, error, options } = props;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {type === 'select' ? (
        <select
          id={id}
          {...register(id)}
          className={cn("w-full rounded-lg border px-3 py-2 text-sm transition-colors", 
            error ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200')}
        >
          <option value="">เลือก{label}</option>
          {options?.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          {...register(id)}
          placeholder={placeholder}
          className={cn("w-full rounded-lg border px-3 py-2 text-sm transition-colors", 
            error ? 'border-red-500 ring-2 ring-red-100' : 'border-gray-200 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200')}
        />
      )}
      {error && <p className="mt-1.5 text-xs text-red-600">{error.message}</p>}
    </div>
  );
};

// --- Main Modal Component ---

export default function EditTaskModal({ isOpen, onClose, task }: EditTaskModalProps) {
  const queryClient = useQueryClient()
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }, // isDirty เช็คว่าฟอร์มมีการเปลี่ยนแปลงหรือไม่
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  // --- Data Mutation ---
  const { mutate: updateTask, isPending, error: mutationError } = useMutation({
    mutationFn: async (data: TaskFormData) => {
      if (!task) throw new Error("No task selected");
      const { error } = await supabase.from('tasks').update(data).eq('id', task.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
    onError: (error) => {
        console.error('Error updating task:', error);
    }
  });

  const onSubmit = (data: TaskFormData) => {
    updateTask(data);
  }

  // Set default form values when task prop changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        assigned_department: task.assigned_department as TaskFormData['assigned_department'],
        signup_date: task.signup_date,
        start_date: task.start_date,
        due_date: task.due_date,
        status: task.status,
      });
    } else {
        reset(); // Clear form if no task
    }
  }, [task, reset]);

  return (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />
                
                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-gray-100 max-h-[90vh] overflow-y-auto"
                >
                    <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </Button>

                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex-shrink-0 bg-sky-100 p-3 rounded-full">
                            <Pencil className="h-6 w-6 text-sky-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">แก้ไขงาน</h2>
                            <p className="text-sm text-gray-500">แก้ไขข้อมูลงาน: {task?.title}</p>
                        </div>
                    </div>
                    
                    {mutationError && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <span>เกิดข้อผิดพลาด: {mutationError.message}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <FormField id="title" label="ชื่องาน" register={register} error={errors.title} placeholder="กรอกชื่องาน" />
                        <FormField id="assigned_department" label="ฝ่ายรับผิดชอบ" type="select" options={DEPARTMENTS} register={register} error={errors.assigned_department} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField id="signup_date" label="วันที่รับสมัคร" type="date" register={register} error={errors.signup_date} />
                            <FormField id="start_date" label="วันที่เริ่มกิจกรรม" type="date" register={register} error={errors.start_date} />
                        </div>
                        <FormField id="due_date" label="วันที่ส่งงาน" type="date" register={register} error={errors.due_date} />
                        <FormField id="status" label="สถานะ" type="select" options={STATUSES} register={register} error={errors.status} />

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-tr from-sky-500 to-blue-600 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 flex items-center justify-center gap-2 transition-all duration-300"
                            disabled={isPending || !isDirty} // Disable if submitting or form hasn't changed
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>กำลังบันทึก...</span>
                                </>
                            ) : (
                                <span>บันทึกการแก้ไข</span>
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
  )
}