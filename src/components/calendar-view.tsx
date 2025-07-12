'use client'

import { useState, useMemo, useCallback, FC } from 'react' // เพิ่ม FC สำหรับ Functional Component types
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, X, Plus, CheckCircle, AlertCircle, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// --- Type Definitions for Props ---

interface CalendarHeaderProps {
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isAnimating: boolean;
}

interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  isSelected: boolean;
  isPast: boolean;
  onClick: () => void;
}


// --- Helper Functions & Components ---

const getStatusInfo = (status: Task['status']) => {
  switch (status) {
    case 'เสร็จสิ้น':
      return {
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle className="h-3 w-3" />,
      }
    case 'กำลังดำเนิน':
      return {
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: <AlertCircle className="h-3 w-3" />,
      }
    default:
      return {
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <Clock className="h-3 w-3" />,
      }
  }
}

const CalendarHeader: FC<CalendarHeaderProps> = ({ currentDate, onPrev, onNext, onToday, isAnimating }) => (
    <motion.div 
        className="flex flex-wrap items-center justify-between gap-4 bg-white/80 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center gap-4">
            <Button onClick={onPrev} variant="ghost" size="icon" className="rounded-xl hover:bg-sky-100" disabled={isAnimating}>
                <ChevronLeft className="h-5 w-5 text-sky-600" />
            </Button>
            <motion.h2 
                key={currentDate.getMonth()}
                className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent w-48 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
            >
                {currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
            </motion.h2>
            <Button onClick={onNext} variant="ghost" size="icon" className="rounded-xl hover:bg-sky-100" disabled={isAnimating}>
                <ChevronRight className="h-5 w-5 text-sky-600" />
            </Button>
        </div>
        
        <div className="flex items-center gap-3">
            <Button onClick={onToday} variant="outline" size="sm" className="rounded-xl">
                <CalendarDays className="h-4 w-4 mr-2" />
                วันนี้
            </Button>
            <Button className="bg-gradient-to-tr from-sky-400 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มงาน
            </Button>
        </div>
    </motion.div>
);

const CalendarDay: FC<CalendarDayProps> = ({ date, tasks, isToday, isSelected, isPast, onClick }) => {
    return (
        <motion.div
            onClick={onClick}
            className={cn(
                'min-h-[120px] p-3 cursor-pointer transition-colors duration-200 border-b border-r border-gray-100 relative group',
                {
                    'bg-gradient-to-br from-sky-50 to-blue-50 ring-2 ring-sky-200': isToday,
                    'bg-white hover:bg-gray-50': !isToday,
                    'ring-2 ring-sky-500 bg-sky-100': isSelected,
                    'opacity-60 bg-gray-50': isPast,
                }
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={cn('text-sm font-semibold', { 'text-sky-600': isToday, 'text-gray-400': isPast, 'text-gray-900': !isPast && !isToday })}>
                    {date.getDate()}
                </span>
                {tasks.length > 0 && (
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full font-medium">
                        {tasks.length}
                    </span>
                )}
            </div>
            
            <div className="space-y-1">
                {tasks.slice(0, 2).map((task: Task) => {
                    const { color, icon } = getStatusInfo(task.status);
                    return (
                        <motion.div
                            key={task.id}
                            className={cn('text-xs p-1.5 rounded-lg border truncate flex items-center gap-1.5', color)}
                            layout
                        >
                            {icon}
                            <span className="truncate font-medium">{task.title}</span>
                        </motion.div>
                    );
                })}
                {tasks.length > 2 && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg text-center">
                        +{tasks.length - 2} งานอื่นๆ
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// --- Main Calendar Component ---

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*')
      if (error) throw error
      return data as Task[]
    },
  })

  // Memoize calendar calculations to improve performance
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    
    const tasksByDate = tasks?.reduce((acc, task) => {
        const taskDate = new Date(task.start_date).toDateString();
        if (!acc[taskDate]) {
            acc[taskDate] = [];
        }
        acc[taskDate].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    return { daysInMonth, firstDayOfMonth, tasksByDate };
  }, [currentDate, tasks]);

  const handleMonthChange = useCallback((offset: number) => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + offset, 1));
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[500px]">...Loading...</div>
  }

  const daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="space-y-8">
      <CalendarHeader 
        currentDate={currentDate}
        onPrev={() => handleMonthChange(-1)}
        onNext={() => handleMonthChange(1)}
        onToday={() => setCurrentDate(new Date())}
        isAnimating={false} // Animation is handled by Framer Motion now
      />

      <motion.div 
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-7 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-gray-200">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: calendarData.firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50/50 border-r border-b border-gray-100" />
          ))}

          {Array.from({ length: calendarData.daysInMonth }).map((_, index) => {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), index + 1);
            const dateString = date.toDateString();
            const tasksForDate = calendarData.tasksByDate?.[dateString] || [];
            const isToday = new Date().toDateString() === dateString;
            const isSelected = selectedDate?.toDateString() === dateString;
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <CalendarDay
                key={dateString}
                date={date}
                tasks={tasksForDate}
                isToday={isToday}
                isSelected={isSelected}
                isPast={isPast}
                onClick={() => setSelectedDate(date)}
              />
            )
          })}
        </div>
      </motion.div>

      {/* Selected Date Details Modal/Panel */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDate(null)} />
            <motion.div
              className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-6 mx-4"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* Content for selected date details goes here */}
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                      {selectedDate.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedDate(null)} className="rounded-full">
                      <X className="h-5 w-5" />
                  </Button>
              </div>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {(calendarData.tasksByDate?.[selectedDate.toDateString()] || []).length > 0 ? (
                  (calendarData.tasksByDate?.[selectedDate.toDateString()] || []).map((task: Task, index: number) => { // Added types here
                    const { color, icon } = getStatusInfo(task.status);
                    return (
                        <motion.div
                            key={task.id}
                            className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow duration-200"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <h4 className="font-semibold text-gray-800">{task.title}</h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-sky-500" />
                                            <span>{task.assigned_department}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-amber-500" />
                                            <span>สิ้นสุด: {task.due_date}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', color)}>
                                    {icon}
                                    {task.status}
                                </span>
                            </div>
                        </motion.div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                      <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
                          <CalendarIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">ไม่มีงานในวันนี้</h4>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}