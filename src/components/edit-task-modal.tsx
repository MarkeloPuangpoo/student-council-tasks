'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { X, Loader2 } from 'lucide-react'
import { Task } from '@/lib/supabase'

const taskSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่องาน'),
  assigned_department: z.enum(['วิชาการ', 'งบประมาณ', 'กิจการนักเรียน', 'ทั่วไป', 'บุคคล', 'สำนักประธานสภานักเรียน'] as const, {
    required_error: 'กรุณาเลือกฝ่ายรับผิดชอบ',
  }),
  signup_date: z.string().min(1, 'กรุณาเลือกวันที่รับสมัคร'),
  start_date: z.string().min(1, 'กรุณาเลือกวันที่เริ่มกิจกรรม'),
  due_date: z.string().min(1, 'กรุณาเลือกวันที่ส่งงาน'),
  status: z.enum(['เสร็จสิ้น', 'กำลังดำเนิน', 'ยังไม่ดำเนินงาน'] as const, {
    required_error: 'กรุณาเลือกสถานะ',
  }),
})

type TaskFormData = z.infer<typeof taskSchema>

interface EditTaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
}

export default function EditTaskModal({ isOpen, onClose, task }: EditTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  })

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        assigned_department: task.assigned_department as "วิชาการ" | "งบประมาณ" | "กิจการนักเรียน" | "ทั่วไป" | "บุคคล" | "สำนักประธานสภานักเรียน",
        signup_date: task.signup_date,
        start_date: task.start_date,
        due_date: task.due_date,
        status: task.status as "เสร็จสิ้น" | "กำลังดำเนิน" | "ยังไม่ดำเนินงาน",
      })
    }
  }, [task, reset])

  const onSubmit = async (data: TaskFormData) => {
    if (!task) return
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', task.id)
      if (error) throw error
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onClose()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-2xl ring-1 ring-gray-100 p-4 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-2 top-2 sm:right-3 sm:top-3 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">แก้ไขงาน</h2>
          <p className="text-sm sm:text-base text-gray-500">แก้ไขข้อมูลงานที่เลือก</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่องาน
            </label>
            <input
              type="text"
              id="title"
              {...register('title')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="กรอกชื่องาน"
            />
            {errors.title && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="assigned_department" className="block text-sm font-medium text-gray-700 mb-1">
              ฝ่ายรับผิดชอบ
            </label>
            <select
              id="assigned_department"
              {...register('assigned_department')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">เลือกฝ่ายรับผิดชอบ</option>
              <option value="วิชาการ">วิชาการ</option>
              <option value="งบประมาณ">งบประมาณ</option>
              <option value="กิจการนักเรียน">กิจการนักเรียน</option>
              <option value="ทั่วไป">ทั่วไป</option>
              <option value="บุคคล">บุคคล</option>
              <option value="สำนักประธานสภานักเรียน">สำนักประธานสภานักเรียน</option>
            </select>
            {errors.assigned_department && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.assigned_department.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="signup_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่รับสมัคร
            </label>
            <input
              type="date"
              id="signup_date"
              {...register('signup_date')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            {errors.signup_date && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.signup_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่เริ่มกิจกรรม
            </label>
            <input
              type="date"
              id="start_date"
              {...register('start_date')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            {errors.start_date && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.start_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
              วันที่ส่งงาน
            </label>
            <input
              type="date"
              id="due_date"
              {...register('due_date')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
            {errors.due_date && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.due_date.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm sm:text-base focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">เลือกสถานะ</option>
              <option value="ยังไม่ดำเนินงาน">ยังไม่ดำเนินงาน</option>
              <option value="กำลังดำเนิน">กำลังดำเนิน</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.status.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-tr from-sky-400 to-blue-700 text-white font-medium px-4 py-2 rounded-xl shadow-md hover:from-sky-500 hover:to-blue-800 flex items-center justify-center gap-2 text-sm sm:text-base"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <span>บันทึกการแก้ไข</span>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
} 