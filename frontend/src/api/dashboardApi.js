import api from "./api";

// ===============================
// ADMIN DASHBOARD
// ===============================

export const getDashboard = async () => {
  const response = await api.get("/dashboard/admin");
  return response.data;
};

export const getDashboardStats = getDashboard;

export const getDashboardStates = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

// ===============================
// STUDENT ANALYTICS
// ===============================

export const getStudentsByDepartment = async () => {
  const response = await api.get("/dashboard/students-by-department");
  return response.data;
};

export const getStudentsBySemester = async () => {
  const response = await api.get("/dashboard/students-by-semester");
  return response.data;
};

export const getAttendanceSummary = async () => {
  const response = await api.get("/dashboard/attendance-summary");
  return response.data;
};

export const getAverageCGPA = async () => {
  const response = await api.get("/dashboard/average-cgpa");
  return response.data;
};

export const getAverageAttendance = async () => {
  const response = await api.get("/dashboard/average-attendance");
  return response.data;
};

// ===============================
// RESULT ANALYTICS
// ===============================

export const getResultSummary = async () => {
  const response = await api.get("/dashboard/result-summary");
  return response.data;
};

export const getGradeDistribution = async () => {
  const response = await api.get("/dashboard/grade-distribution");
  return response.data.grades;
};

export const getDepartmentPerformance = async () => {
  const response = await api.get("/dashboard/department-performance");
  return response.data.departments;
};

export const getTopStudents = async () => {
  const response = await api.get("/dashboard/top-students");
  return response.data.students;
};

// ===============================
// ATTENDANCE ANALYTICS
// ===============================

export const getMonthlyAttendance = async () => {
  const response = await api.get("/dashboard/monthly-attendance");
  return response.data.attendance;
};

// ===============================
// COURSE & TEACHER ANALYTICS
// ===============================

export const getCoursePerformance = async () => {
  const response = await api.get("/dashboard/course-performance");
  return response.data.courses;
};

export const getTeacherPerformance = async () => {
  const response = await api.get("/dashboard/teacher-performance");
  return response.data.teachers;
};

// ===============================
// RISK ANALYTICS
// ===============================

export const getAtRiskStudents = async () => {
  const response = await api.get("/dashboard/at-risk-students");
  return response.data.students;
};

// ===============================
// PERFORMANCE ANALYTICS
// ===============================

export const getDepartmentPassRate = async () => {
  const response = await api.get("/dashboard/department-pass-rate");
  return response.data.departments;
};

export const getPerformanceTrend = async () => {
  const response = await api.get("/dashboard/performance-trend");
  return response.data.trend;
};

// ===============================
// FILTER DATA
// ===============================

export const getDepartments = async () => {
  const response = await api.get("/dashboard/departments");
  return response.data.departments;
};

export const getSemesters = async () => {
  const response = await api.get("/dashboard/semesters");
  return response.data.semesters;
};