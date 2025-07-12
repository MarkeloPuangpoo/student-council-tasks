'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, X, Plus, CheckCircle, AlertCircle, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '@/lib/supabase'

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Task[]
    },
  })

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    return { daysInMonth, firstDayOfMonth }
  }

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate)

  const getTasksForDate = (date: Date) => {
    if (!tasks) return []
    return tasks.filter(task => {
      const taskDate = new Date(task.start_date)
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const handlePrevMonth = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleNextMonth = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'เสร็จสิ้น':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'กำลังดำเนิน':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'รอดำเนินการ':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'เสร็จสิ้น':
        return <CheckCircle className="h-3 w-3" />
      case 'กำลังดำเนิน':
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-sky-400 animate-ping"></div>
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">กำลังโหลดปฏิทิน...</p>
            <p className="text-sm text-gray-500 mt-1">กรุณารอสักครู่</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-6">
          <motion.div
            className="flex items-center gap-4"
            animate={{ x: isAnimating ? [-5, 5, -5] : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={handlePrevMonth}
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-sky-50 border border-sky-200 hover:border-sky-300 transition-all duration-200 hover:scale-105"
              disabled={isAnimating}
            >
              <ChevronLeft className="h-5 w-5 text-sky-600" />
            </Button>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
              {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              onClick={handleNextMonth}
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-sky-50 border border-sky-200 hover:border-sky-300 transition-all duration-200 hover:scale-105"
              disabled={isAnimating}
            >
              <ChevronRight className="h-5 w-5 text-sky-600" />
            </Button>
          </motion.div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setCurrentDate(new Date())}
            variant="ghost"
            size="sm"
            className="text-sm border border-sky-200 hover:bg-sky-50 text-sky-600 font-medium px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            วันนี้
          </Button>
          <Button
            className="bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-medium px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            เพิ่มงาน
          </Button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div 
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-gray-200">
          {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
            <div
              key={day}
              className="p-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50/50 border-r border-gray-100 last:border-r-0" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1)
            const tasksForDate = getTasksForDate(date)
            const isToday = new Date().toDateString() === date.toDateString()
            const isSelected = selectedDate?.toDateString() === date.toDateString()
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))

            return (
              <motion.div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`min-h-[120px] p-3 cursor-pointer transition-all duration-200 border-r border-gray-100 last:border-r-0 relative group
                  ${isToday ? 'bg-gradient-to-br from-sky-50 to-blue-50 ring-2 ring-sky-200' : 'bg-white hover:bg-gray-50'}
                  ${isSelected ? 'ring-2 ring-sky-500 bg-sky-50' : ''}
                  ${isPast ? 'opacity-60' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${
                    isToday ? 'text-sky-600' : 
                    isPast ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {index + 1}
                  </span>
                  {tasksForDate.length > 0 && (
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full font-medium">
                      {tasksForDate.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {tasksForDate.slice(0, 2).map((task) => (
                    <motion.div
                      key={task.id}
                      className={`text-xs p-2 rounded-lg border ${getStatusColor(task.status)} truncate flex items-center gap-1`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {getStatusIcon(task.status)}
                      <span className="truncate">{task.title}</span>
                    </motion.div>
                  ))}
                  {tasksForDate.length > 2 && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg text-center">
                      +{tasksForDate.length - 2} งานอื่นๆ
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-6"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <p className="text-gray-500 mt-1">
                  {getTasksForDate(selectedDate).length} งานในวันนี้
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDate(null)}
                className="rounded-xl hover:bg-gray-100 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {getTasksForDate(selectedDate).map((task, index) => (
                <motion.div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-sky-500" />
                          <span>{task.assigned_department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>{task.due_date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {getTasksForDate(selectedDate).length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">ไม่มีงานในวันนี้</h4>
                  <p className="text-gray-500 mb-4">คุณสามารถเพิ่มงานใหม่ได้โดยคลิกปุ่ม &ldquo;เพิ่มงาน&rdquo;</p>
                  <Button className="bg-gradient-to-tr from-sky-400 to-blue-600 text-white font-medium px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มงานใหม่
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 