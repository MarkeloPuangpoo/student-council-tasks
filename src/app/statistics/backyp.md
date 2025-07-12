'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Task } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import { BarChart, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { ApexOptions } from 'apexcharts'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function StatisticsPage() {
  const { user } = useAuth()
  const router = useRouter()

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

  // ตรวจสอบการล็อกอิน
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  // ถ้ายังไม่ได้ล็อกอิน หรือกำลังโหลดข้อมูล ให้แสดง loading
  if (!user || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  // สถิติตามสถานะ
  const statusData = tasks?.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // สถิติตามฝ่าย
  const departmentData = tasks?.reduce((acc, task) => {
    acc[task.assigned_department] = (acc[task.assigned_department] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // สถิติงานด่วน
  const urgentTasks = tasks?.filter(task => {
    const now = new Date()
    const dueDate = new Date(task.due_date)
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilDue <= 3 && task.status !== 'เสร็จสิ้น'
  }).length || 0

  // สถิติงานเสร็จล่าช้า
  const overdueTasks = tasks?.filter(task => {
    const now = new Date()
    const dueDate = new Date(task.due_date)
    return dueDate < now && task.status !== 'เสร็จสิ้น'
  }).length || 0

  // สถิติรายเดือน
  const monthlyData = tasks?.reduce((acc, task) => {
    const date = new Date(task.created_at)
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[monthYear]) {
      acc[monthYear] = {
        total: 0,
        departments: {} as Record<string, number>
      }
    }
    acc[monthYear].total++
    acc[monthYear].departments[task.assigned_department] = 
      (acc[monthYear].departments[task.assigned_department] || 0) + 1
    return acc
  }, {} as Record<string, { total: number; departments: Record<string, number> }>)

  // จัดเรียงข้อมูลรายเดือน
  const sortedMonths = Object.keys(monthlyData || {}).sort()
  const monthlyLabels = sortedMonths.map(month => {
    const [year, monthNum] = month.split('-')
    const date = new Date(parseInt(year), parseInt(monthNum) - 1)
    return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
  })

  // หาฝ่ายที่มีงานเยอะที่สุดในแต่ละเดือน
  const topDepartmentsByMonth = sortedMonths.map(month => {
    const departments = monthlyData?.[month].departments || {}
    const maxDepartment = Object.entries(departments).reduce((max, [dept, count]) => 
      count > (max.count || 0) ? { dept, count } : max
    , { dept: '', count: 0 })
    return {
      month: month,
      department: maxDepartment.dept,
      count: maxDepartment.count
    }
  })

  // ตั้งค่า Pie Chart สำหรับสถานะ
  const statusChartOptions: ApexOptions = {
    chart: {
      type: 'pie',
      fontFamily: 'Kanit, sans-serif',
    },
    labels: Object.keys(statusData || {}),
    colors: ['#22c55e', '#eab308', '#6b7280'],
    legend: {
      position: 'bottom',
      fontFamily: 'Kanit, sans-serif',
      fontSize: '14px',
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    dataLabels: {
      style: {
        fontFamily: 'Kanit, sans-serif',
      }
    }
  }

  // ตั้งค่า Bar Chart สำหรับฝ่าย
  const departmentChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Kanit, sans-serif',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        barHeight: '70%',
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontFamily: 'Kanit, sans-serif',
        fontSize: '12px',
      }
    },
    xaxis: {
      categories: Object.keys(departmentData || {}),
      labels: {
        style: {
          fontFamily: 'Kanit, sans-serif',
        }
      }
    },
    colors: ['#3b82f6'],
    grid: {
      borderColor: '#f1f5f9',
    }
  }

  // ตั้งค่า Line Chart สำหรับสถิติรายเดือน
  const monthlyChartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false
      },
      fontFamily: 'Kanit, sans-serif',
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    markers: {
      size: 4,
      hover: {
        size: 6
      }
    },
    xaxis: {
      categories: monthlyLabels,
      labels: {
        style: {
          fontFamily: 'Kanit, sans-serif',
        }
      }
    },
    yaxis: {
      title: {
        text: 'จำนวนงาน',
        style: {
          fontFamily: 'Kanit, sans-serif',
        }
      },
      labels: {
        style: {
          fontFamily: 'Kanit, sans-serif',
        }
      }
    },
    colors: ['#3b82f6'],
    tooltip: {
      y: {
        formatter: (value) => `${value} งาน`
      },
      style: {
        fontFamily: 'Kanit, sans-serif',
      }
    },
    grid: {
      borderColor: '#f1f5f9',
    }
  }

  return (
    <section className="mx-auto w-full max-w-none py-8 px-2 md:px-0">
      <div className="mb-8 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-400 to-blue-700 p-4 shadow-lg">
          <BarChart className="h-10 w-10 text-white" />
        </div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">สถิติงาน</h1>
        <p className="text-lg text-gray-500">ภาพรวมและสถิติของงานทั้งหมด</p>
      </div>

      {/* สรุปภาพรวม */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-sky-50">
              <TrendingUp className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">งานทั้งหมด</h3>
              <p className="text-3xl font-bold text-sky-600">{tasks?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">งานด่วน</h3>
              <p className="text-3xl font-bold text-red-600">{urgentTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">งานเสร็จล่าช้า</h3>
              <p className="text-3xl font-bold text-yellow-600">{overdueTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700">งานเสร็จสิ้น</h3>
              <p className="text-3xl font-bold text-green-600">
                {statusData?.['เสร็จสิ้น'] || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* กราฟ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* กราฟวงกลมแสดงสถานะ */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">สถานะงาน</h3>
          {tasks && (
            <Chart
              options={statusChartOptions}
              series={Object.values(statusData || {})}
              type="pie"
              height={350}
            />
          )}
        </div>

        {/* กราฟแท่งแสดงฝ่าย */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">งานตามฝ่าย</h3>
          {tasks && (
            <Chart
              options={departmentChartOptions}
              series={[{
                data: Object.values(departmentData || {})
              }]}
              type="bar"
              height={350}
            />
          )}
        </div>
      </div>

      {/* สถิติรายเดือน */}
      <div className="grid grid-cols-1 gap-8">
        {/* กราฟเส้นแสดงจำนวนงานรายเดือน */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">จำนวนงานรายเดือน</h3>
          {tasks && (
            <Chart
              options={monthlyChartOptions}
              series={[{
                name: 'จำนวนงาน',
                data: sortedMonths.map(month => monthlyData?.[month].total || 0)
              }]}
              type="line"
              height={350}
            />
          )}
        </div>

        {/* ตารางแสดงฝ่ายที่มีงานเยอะที่สุดในแต่ละเดือน */}
        <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">ฝ่ายที่มีงานเยอะที่สุดในแต่ละเดือน</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">เดือน</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">ฝ่าย</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">จำนวนงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topDepartmentsByMonth.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(item.month).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.count} งาน</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
} 