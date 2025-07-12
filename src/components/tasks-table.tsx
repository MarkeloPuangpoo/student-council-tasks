'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus, Search, Pencil, Trash2, LogIn } from 'lucide-react'
import AddTaskModal from './add-task-modal'
import EditTaskModal from './edit-task-modal'
import { Task } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

// Function to check if task is urgent
const isTaskUrgent = (task: Task) => {
  const now = new Date()
  const dueDate = new Date(task.due_date)
  const createdDate = new Date(task.created_at)
  
  // Calculate time difference in days
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const daysSinceCreated = Math.ceil((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
  
  // Task is urgent if:
  // 1. Less than 3 days until due date AND
  // 2. Status is not completed AND
  // 3. Task was created more than 1 day ago
  return daysUntilDue <= 3 && 
         task.status !== 'เสร็จสิ้น' && 
         daysSinceCreated > 1
}

export default function TasksTable() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Check authentication status
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  // Check auth on component mount
  useEffect(() => {
    checkAuth()
  }, [])

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

  const handleAddTask = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setIsAddModalOpen(true)
  }

  const handleEditTask = (task: Task) => {
    if (!user) {
      router.push('/login')
      return
    }
    setEditingTask(task)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user) {
      router.push('/login')
      return
    }
    if (window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่?')) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId)
        if (error) throw error
        window.location.reload()
      } catch (error) {
        console.error('Error deleting task:', error)
        alert('เกิดข้อผิดพลาดในการลบงาน')
      }
    }
  }

  const filteredTasks = tasks?.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter ? task.status === statusFilter : true
    const matchesDepartment = departmentFilter ? task.assigned_department === departmentFilter : true
    return matchesSearch && matchesStatus && matchesDepartment
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหางาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
            >
              <option value="">ทุกสถานะ</option>
              <option value="ยังไม่ดำเนินงาน">ยังไม่ดำเนินงาน</option>
              <option value="กำลังดำเนิน">กำลังดำเนิน</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
            >
              <option value="">ทุกฝ่าย</option>
              <option value="วิชาการ">วิชาการ</option>
              <option value="งบประมาณ">งบประมาณ</option>
              <option value="ทั่วไป">ทั่วไป</option>
              <option value="บุคคล">บุคคล</option>
              <option value="กิจการนักเรียน">กิจการนักเรียน</option>
              <option value="สำนักประธานสภานักเรียน">สำนักประธานสภานักเรียน</option>
            </select>
          </div>
        </div>
        <Button
          onClick={handleAddTask}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          {user ? (
            <>
              <Plus className="h-5 w-5" />
              <span>เพิ่มงาน</span>
            </>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              <span>เข้าสู่ระบบเพื่อเพิ่มงาน</span>
            </>
          )}
        </Button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ชื่องาน</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ฝ่ายรับผิดชอบ</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">วันที่รับสมัคร</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">วันที่เริ่มงาน</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">วันที่สิ้นสุด</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">สถานะ</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks?.map((task) => {
                const isUrgent = isTaskUrgent(task)
                return (
                  <tr 
                    key={task.id} 
                    className={`hover:bg-gray-50 ${isUrgent ? 'bg-red-50' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {task.title}
                      {isUrgent && (
                        <span className="ml-2 text-red-600 font-medium">(ด่วนที่สุด)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.assigned_department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.signup_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.start_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{task.due_date}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'เสร็จสิ้น'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'กำลังดำเนิน'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTask(task)}
                          className="rounded-full hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                          className="rounded-full hover:bg-gray-100"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTasks?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">ไม่พบงานที่ค้นหา</p>
        </div>
      )}

      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {editingTask && (
        <EditTaskModal
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          task={editingTask}
        />
      )}
    </div>
  )
}