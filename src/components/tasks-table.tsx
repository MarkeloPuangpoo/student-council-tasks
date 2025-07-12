'use client'

import { useState, useMemo, FC } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Plus, Search, Pencil, Trash2, LogIn } from 'lucide-react'
import AddTaskModal from './add-task-modal'
import EditTaskModal from './edit-task-modal'
import { Task } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js' // Import User type

// --- Type Definitions ---

interface FilterState {
  search: string;
  status: string;
  department: string;
}

interface TableToolbarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onAddTaskClick: () => void;
  user: User | null;
}


// --- Helper Functions & Components ---

const isTaskUrgent = (task: Task) => {
  const now = new Date()
  const dueDate = new Date(task.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilDue <= 3 && task.status !== 'เสร็จสิ้น'
}

const getStatusBadge = (status: Task['status']) => {
  const styles = {
    'เสร็จสิ้น': 'bg-green-100 text-green-800',
    'กำลังดำเนิน': 'bg-yellow-100 text-yellow-800',
    'ยังไม่ดำเนินงาน': 'bg-gray-100 text-gray-800',
  }
  return styles[status] || styles['ยังไม่ดำเนินงาน']
}

const TableToolbar: FC<TableToolbarProps> = ({ filters, setFilters, onAddTaskClick, user }) => (
  <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหางาน..."
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors"
        />
      </div>
      <div className="flex gap-2">
        <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} className="px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors bg-white">
          <option value="">ทุกสถานะ</option>
          <option value="ยังไม่ดำเนินงาน">ยังไม่ดำเนินงาน</option>
          <option value="กำลังดำเนิน">กำลังดำเนิน</option>
          <option value="เสร็จสิ้น">เสร็จสิ้น</option>
        </select>
        <select value={filters.department} onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))} className="px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-colors bg-white">
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
    <Button onClick={onAddTaskClick} className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 w-full md:w-auto">
      {user ? <Plus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
      <span>{user ? 'เพิ่มงาน' : 'เข้าสู่ระบบเพื่อเพิ่มงาน'}</span>
    </Button>
  </div>
);

// --- Main Table Component ---

export default function TasksTable() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { user } = useAuth()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<FilterState>({ // <-- กำหนด Type ที่นี่
    search: '',
    status: '',
    department: '',
  })

  // --- Data Fetching ---
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return data as Task[]
    },
  })

  // --- Data Mutation (Delete) ---
  const { mutate: deleteTask } = useMutation({
    mutationFn: async (taskId: string) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (error) throw new Error(error.message);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => {
        console.error('Error deleting task:', err);
        alert('เกิดข้อผิดพลาดในการลบงาน');
    }
  });

  const handleDeleteTask = (taskId: string) => {
    if (!user) return router.push('/login');
    if (window.confirm('คุณต้องการลบงานนี้ใช่หรือไม่?')) {
      deleteTask(taskId);
    }
  }

  const handleAddTaskClick = () => {
    if (!user) return router.push('/login');
    setIsAddModalOpen(true);
  }
  
  const handleEditTask = (task: Task) => {
    if (!user) return router.push('/login');
    setEditingTask(task);
  }

  // --- Memoized Filtering ---
  const filteredTasks = useMemo(() => {
    return tasks?.filter((task) => {
      const { search, status, department } = filters;
      return (
        task.title.toLowerCase().includes(search.toLowerCase()) &&
        (status ? task.status === status : true) &&
        (department ? task.assigned_department === department : true)
      )
    })
  }, [tasks, filters])


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>
  }

  return (
    <div className="space-y-6">
      <TableToolbar filters={filters} setFilters={setFilters} onAddTaskClick={handleAddTaskClick} user={user} />

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                {['ชื่องาน', 'ฝ่ายรับผิดชอบ', 'วันที่รับสมัคร', 'วันที่เริ่มงาน', 'วันที่สิ้นสุด', 'สถานะ', ''].map(h => (
                    <th key={h} className="px-6 py-3 text-left font-medium text-gray-500 tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks?.map((task) => (
                <tr key={task.id} className={cn("hover:bg-gray-50 transition-colors", { 'bg-red-50/50': isTaskUrgent(task) })}>
                  <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                    {task.title}
                    {isTaskUrgent(task) && ( <span className="ml-2 text-red-600 font-bold">(ด่วน)</span> )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{task.assigned_department}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{task.signup_date}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{task.start_date}</td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{task.due_date}</td>
                  <td className="px-6 py-4">
                    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadge(task.status))}>
                      {task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} className="rounded-full h-8 w-8 hover:bg-gray-200">
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="rounded-full h-8 w-8 hover:bg-red-100">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTasks?.length === 0 && (
        <div className="text-center py-16">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">ไม่พบงานที่ค้นหา</h3>
          <p className="mt-1 text-sm text-gray-500">ลองปรับเปลี่ยนคำค้นหาหรือตัวกรองของคุณ</p>
        </div>
      )}

      <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      {editingTask && (
        <EditTaskModal isOpen={!!editingTask} onClose={() => setEditingTask(null)} task={editingTask} />
      )}
    </div>
  )
}