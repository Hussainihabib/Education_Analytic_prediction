import api from "./api";

// ==============================
// Spark: Students by Department
// GET /spark/students-by-department (Admin/Analyst)
// ==============================
export const getSparkStudentsByDepartment = async () => {
  const response = await api.get("/spark/students-by-department");
  return response.data;
};

// ==============================
// Spark: Attendance Summary
// GET /spark/attendance-summary (Admin/Analyst)
// ==============================
export const getSparkAttendanceSummary = async () => {
  const response = await api.get("/spark/attendance-summary");
  return response.data;
};

// ==============================
// Spark: Result Summary
// GET /spark/result-summary (Admin/Analyst)
// ==============================
export const getSparkResultSummary = async () => {
  const response = await api.get("/spark/result-summary");
  return response.data;
};
