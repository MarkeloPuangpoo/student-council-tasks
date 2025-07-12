'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Task } from '@/lib/supabase'
import dynamic from 'next/dynamic'
import { BarChart, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, Target, Award, Activity } from 'lucide-react'
import { ApexOptions } from 'apexcharts'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// --- Reusable Components ---

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[600px]">
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
        <p className="text-gray-600 font-medium">กำลังโหลดสถิติ...</p>
        <p className="text-sm text-gray-500 mt-1">กรุณารอสักครู่</p>
      </div>
    </motion.div>
  </div>
);

// เพิ่ม type สำหรับ StatCard
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  iconColor: string;
  index: number;
}

const StatCard = ({ title, value, icon: Icon, bgColor, textColor, iconColor, index }: StatCardProps) => (
  <motion.div
    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
    whileHover={{ scale: 1.02, y: -5 }}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  </motion.div>
);

// เพิ่ม type สำหรับ ChartCard
interface ChartCardProps {
  title: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, icon: Icon, iconBg, iconColor, children }: ChartCardProps) => (
  <motion.div
    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
    whileHover={{ scale: 1.02 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    {children}
  </motion.div>
);


// --- Main Page Component ---

export default function StatisticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isClientLoading, setIsClientLoading] = useState(true)

  const { data: tasks, isLoading: tasksLoading } = useQuery({
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

  // --- Auth & Loading State ---

  useEffect(() => {
    if (!tasksLoading && !user) {
      router.push('/login')
    }
  }, [user, tasksLoading, router])
  
  useEffect(() => {
    if (!tasksLoading) {
      setTimeout(() => setIsClientLoading(false), 500)
    }
  }, [tasksLoading])

  // --- Data Processing (Memoized) ---
  const stats = useMemo(() => {
    if (!tasks) return null;

    const statusData = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const departmentData = tasks.reduce((acc, task) => {
        acc[task.assigned_department] = (acc[task.assigned_department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    const urgentTasks = tasks.filter(task => {
        const now = new Date();
        const dueDate = new Date(task.due_date);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3 && task.status !== 'เสร็จสิ้น';
    }).length;

    const overdueTasks = tasks.filter(task => {
        const now = new Date();
        const dueDate = new Date(task.due_date);
        return dueDate < now && task.status !== 'เสร็จสิ้น';
    }).length;

    const monthlyData = tasks.reduce((acc, task) => {
        const date = new Date(task.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthYear]) {
            acc[monthYear] = { total: 0, departments: {} as Record<string, number> };
        }
        acc[monthYear].total++;
        acc[monthYear].departments[task.assigned_department] = 
            (acc[monthYear].departments[task.assigned_department] || 0) + 1;
        return acc;
    }, {} as Record<string, { total: number; departments: Record<string, number> }>);

    const sortedMonths = Object.keys(monthlyData).sort();

    const topDepartmentsByMonth = sortedMonths.map(month => {
        const departments = monthlyData[month].departments;
        const maxDepartment = Object.entries(departments).reduce((max, [dept, count]) => 
            count > (max.count || 0) ? { dept, count } : max
        , { dept: '', count: 0 });
        return {
            month,
            department: maxDepartment.dept,
            count: maxDepartment.count
        };
    });

    const completionRate = tasks.length ? Math.round((statusData['เสร็จสิ้น'] || 0) / tasks.length * 100) : 0;

    return {
        totalTasks: tasks.length,
        statusData,
        departmentData,
        urgentTasks,
        overdueTasks,
        monthlyData,
        sortedMonths,
        topDepartmentsByMonth,
        completionRate
    };
  }, [tasks]);


  // --- Chart Options ---

  const statusChartOptions: ApexOptions = {
    chart: { type: 'pie', fontFamily: 'Kanit, sans-serif' },
    labels: Object.keys(stats?.statusData || {}),
    colors: ['#10b981', '#f59e0b', '#6b7280'],
    legend: { position: 'bottom', fontFamily: 'Kanit, sans-serif', fontSize: '14px' },
    dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%`, style: { fontFamily: 'Kanit, sans-serif' } },
    plotOptions: { pie: { donut: { size: '65%' } } }
  };

  const departmentChartOptions: ApexOptions = {
    chart: { type: 'bar', fontFamily: 'Kanit, sans-serif', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 8, horizontal: true, barHeight: '70%', distributed: true } },
    dataLabels: { enabled: true, style: { fontFamily: 'Kanit, sans-serif' } },
    xaxis: { categories: Object.keys(stats?.departmentData || {}), labels: { style: { fontFamily: 'Kanit, sans-serif' } } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 5 }
  };

  const monthlyChartOptions: ApexOptions = {
    chart: { type: 'line', fontFamily: 'Kanit, sans-serif', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 4 },
    markers: { size: 6, hover: { size: 8 } },
    xaxis: {
      categories: stats?.sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('th-TH', { month: 'short', year: '2-digit' });
      }),
      labels: { style: { fontFamily: 'Kanit, sans-serif' } }
    },
    yaxis: { title: { text: 'จำนวนงาน', style: { fontFamily: 'Kanit, sans-serif' } } },
    tooltip: { y: { formatter: (value) => `${value} งาน` } },
    grid: { borderColor: '#f1f5f9', strokeDashArray: 5 },
    fill: {
      type: 'gradient',
      gradient: { shade: 'light', type: 'vertical', opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 100] }
    }
  };

  if (!user || isClientLoading || !stats) {
    return <LoadingSpinner />;
  }

  const statsCards = [
    { title: 'งานทั้งหมด', value: stats.totalTasks, icon: TrendingUp, color: 'sky', bgColor: 'bg-sky-50', textColor: 'text-sky-600', iconColor: 'text-sky-600' },
    { title: 'งานด่วน', value: stats.urgentTasks, icon: AlertTriangle, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-600', iconColor: 'text-red-600' },
    { title: 'งานเสร็จล่าช้า', value: stats.overdueTasks, icon: Clock, color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-600', iconColor: 'text-amber-600' },
    { title: 'งานเสร็จสิ้น', value: stats.statusData['เสร็จสิ้น'] || 0, icon: CheckCircle, color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', iconColor: 'text-emerald-600' }
  ];


  return (
    <section className="mx-auto w-full max-w-none py-8 px-4 md:px-8">
      {/* Header */}
      <motion.div 
        className="mb-12 flex flex-col items-center justify-center gap-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-blue-700 p-6 shadow-xl"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <BarChart className="h-12 w-12 text-white" />
        </motion.div>
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent">
            สถิติงาน
          </h1>
          <p className="text-lg text-gray-600 mt-2">ภาพรวมและสถิติของงานทั้งหมดในระบบ</p>
        </div>
      </motion.div>

      {/* สรุปภาพรวม */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {statsCards.map((card, index) => (
          <StatCard {...card} index={index} key={index} />
        ))}
      </motion.div>

      {/* Completion Rate Card */}
      <motion.div 
        className="mb-12 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8 border border-emerald-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">อัตราการเสร็จสิ้นงาน</h2>
            <p className="text-emerald-600">เปอร์เซ็นต์งานที่เสร็จสิ้นจากทั้งหมด</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-emerald-600">{stats.completionRate}%</div>
            <div className="text-sm text-emerald-500">จาก {stats.totalTasks} งาน</div>
          </div>
        </div>
        <div className="mt-6 bg-emerald-200 rounded-full h-3">
          <motion.div 
            className="bg-emerald-500 h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 1, delay: 0.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* กราฟ */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <ChartCard title="สถานะงาน" icon={Target} iconBg="bg-sky-50" iconColor="text-sky-600">
          <Chart options={statusChartOptions} series={Object.values(stats.statusData)} type="pie" height={350} />
        </ChartCard>

        <ChartCard title="งานตามฝ่าย" icon={Users} iconBg="bg-purple-50" iconColor="text-purple-600">
          <Chart options={departmentChartOptions} series={[{ data: Object.values(stats.departmentData) }]} type="bar" height={350} />
        </ChartCard>
      </motion.div>

      {/* สถิติรายเดือน */}
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <ChartCard title="จำนวนงานรายเดือน" icon={Activity} iconBg="bg-blue-50" iconColor="text-blue-600">
          <Chart options={monthlyChartOptions} series={[{ name: 'จำนวนงาน', data: stats.sortedMonths.map(month => stats.monthlyData[month].total) }]} type="line" height={350} />
        </ChartCard>
        
        <motion.div 
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-50">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">ฝ่ายที่มีงานเยอะที่สุดในแต่ละเดือน</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">เดือน</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ฝ่าย</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">จำนวนงาน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.topDepartmentsByMonth.map((item, index) => (
                  <motion.tr 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors duration-200"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {new Date(item.month).toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.department || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                        {item.count} งาน
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}