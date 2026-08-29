import { createContext, useContext, useState } from 'react'
import {
  generateStudents, generateTeachers, departments as seedDepartments, courses as seedCourses,
  notifications as seedNotifications,
} from '../data/mockData.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [students, setStudents] = useState(() => generateStudents(60))
  const [teachers, setTeachers] = useState(() => generateTeachers(22))
  const [courseList, setCourseList] = useState(seedCourses)
  const [departmentList, setDepartmentList] = useState(seedDepartments)
  const [notifs, setNotifs] = useState(seedNotifications)
  const [toast, setToast] = useState(null)

  const showToast = (message, tone = 'success') => {
    setToast({ message, tone, key: Date.now() })
    setTimeout(() => setToast(null), 3200)
  }

  // ---- Students ----
  const addStudent = (s) => {
    setStudents((prev) => [{ id: `STU${1000 + prev.length + randSuffix()}`, risk: 'low', predictedDropout: 10, status: 'active', ...s }, ...prev])
    showToast('Student added successfully.')
  }
  const updateStudent = (id, patch) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    showToast('Student updated.')
  }
  const deleteStudent = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    showToast('Student removed.', 'warning')
  }

  // ---- Teachers ----
  const addTeacher = (t) => {
    setTeachers((prev) => [{ id: `TCH${200 + prev.length + randSuffix()}`, status: 'active', rating: 4.0, ...t }, ...prev])
    showToast('Teacher added successfully.')
  }
  const updateTeacher = (id, patch) => {
    setTeachers((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    showToast('Teacher updated.')
  }
  const deleteTeacher = (id) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id))
    showToast('Teacher removed.', 'warning')
  }

  // ---- Courses ----
  const addCourse = (c) => {
    setCourseList((prev) => [{ enrolled: 0, credits: 3, ...c }, ...prev])
    showToast('Course created.')
  }
  const updateCourse = (code, patch) => {
    setCourseList((prev) => prev.map((c) => (c.code === code ? { ...c, ...patch } : c)))
    showToast('Course updated.')
  }
  const deleteCourse = (code) => {
    setCourseList((prev) => prev.filter((c) => c.code !== code))
    showToast('Course removed.', 'warning')
  }

  // ---- Departments ----
  const addDepartment = (d) => {
    setDepartmentList((prev) => [{ courses: 0, students: 0, ...d }, ...prev])
    showToast('Department created.')
  }
  const updateDepartment = (id, patch) => {
    setDepartmentList((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
    showToast('Department updated.')
  }
  const deleteDepartment = (id) => {
    setDepartmentList((prev) => prev.filter((d) => d.id !== id))
    showToast('Department removed.', 'warning')
  }

  // ---- Notifications ----
  const markNotifRead = (id) => setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  const dismissNotif = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id))

  return (
    <DataContext.Provider
      value={{
        students, addStudent, updateStudent, deleteStudent,
        teachers, addTeacher, updateTeacher, deleteTeacher,
        courseList, addCourse, updateCourse, deleteCourse,
        departmentList, addDepartment, updateDepartment, deleteDepartment,
        notifs, markNotifRead, markAllRead, dismissNotif,
        toast, showToast,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

function randSuffix() { return Math.floor(Math.random() * 900) }

export const useData = () => useContext(DataContext)
