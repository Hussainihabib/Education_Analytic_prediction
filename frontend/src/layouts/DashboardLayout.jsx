import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import Toast from '../components/Toast.jsx'

const TITLES = {
  '/app/admin': 'Admin Dashboard',
  '/app/teacher': 'Teacher Dashboard',
  '/app/student': 'Student Dashboard',
  '/app/analyst': 'Analyst Dashboard',
  '/app/students': 'Student Management',
  '/app/teachers': 'Teacher Management',
  '/app/courses': 'Course Management',
  '/app/results': 'Results',
  '/app/attendance': 'Attendance',
  '/app/departments': 'Department Management',
  '/app/ingestion': 'Data Ingestion',
  '/app/hdfs': 'HDFS Storage',
  '/app/spark': 'Spark Processing',
  '/app/live': 'Real-Time Live View',
  '/app/ml': 'Machine Learning Hub',
  '/app/analytics': 'Analytics Dashboard',
  '/app/reports': 'Reports Generator',
  '/app/notifications': 'Notification Center',
  '/app/support': 'Feedback & Support',
  '/app/settings': 'Settings',
}

export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const title = TITLES[pathname] || 'EduPredict'

  return (
    <div className="flex h-screen overflow-hidden bg-cream-50 dark:bg-navy-950">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
