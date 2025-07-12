'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { X, Loader2, Calendar, Users, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

const taskSchema = z.object({
  title: z.string().min(1, 'กรุณากรอกชื่องาน'),
  assigned_department: z.string().min(1, 'กรุณาเลือกฝ่าย'),
  signup_date: z.string().min(1, 'กรุณาเลือกวันที่รับสมัคร'),
  start_date: z.string().min(1, 'กรุณาเลือกวันที่เริ่มงาน'),
  due_date: z.string().min(1, 'กรุณาเลือกวันที่สิ้นสุด'),
  status: z.string().min(1, 'กรุณาเลือกสถานะ'),
})

type TaskFormData = z.infer<typeof taskSchema>

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'ยังไม่ดำเนินงาน',
    },
  })

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const { error: insertError } = await supabase.from('tasks').insert([
        {
          ...data,
          created_at: new Date().toISOString(),
        },
      ])

      if (insertError) throw insertError

      // Invalidate and refetch tasks
      await queryClient.invalidateQueries({ queryKey: ['tasks'] })
      
      // Reset form and close modal
      reset()
      onClose()
    } catch (err) {
      console.error('Error adding task:', err)
      setError('เกิดข้อผิดพลาดในการเพิ่มงาน กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">เพิ่มงานใหม่</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ชื่องาน
              </label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                placeholder="กรอกชื่องาน"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                ฝ่ายที่รับผิดชอบ
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  {...register('assigned_department')}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors appearance-none bg-white"
                >
                  <option value="">เลือกฝ่าย</option>
                  <option value="วิชาการ">วิชาการ</option>
                  <option value="งบประมาณ">งบประมาณ</option>
                  <option value="ทั่วไป">ทั่วไป</option>
                  <option value="บุคคล">บุคคล</option>
                  <option value="กิจการนักเรียน">กิจการนักเรียน</option>
                  <option value="สำนักประธานสภานักเรียน">สำนักประธานสภานักเรียน</option>
                </select>
              </div>
              {errors.assigned_department && (
                <p className="text-sm text-red-500">{errors.assigned_department.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                วันที่รับสมัคร
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('signup_date')}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                />
              </div>
              {errors.signup_date && (
                <p className="text-sm text-red-500">{errors.signup_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                วันที่เริ่มงาน
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('start_date')}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                />
              </div>
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                วันที่สิ้นสุด
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  {...register('due_date')}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
                />
              </div>
              {errors.due_date && (
                <p className="text-sm text-red-500">{errors.due_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                สถานะ
              </label>
              <select
                {...register('status')}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
              >
                <option value="ยังไม่ดำเนินงาน">ยังไม่ดำเนินงาน</option>
                <option value="กำลังดำเนิน">กำลังดำเนิน</option>
                <option value="เสร็จสิ้น">เสร็จสิ้น</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 bg-sky-500 hover:bg-sky-600 text-white"
            >
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
      </div>
    </div>
  )
} 