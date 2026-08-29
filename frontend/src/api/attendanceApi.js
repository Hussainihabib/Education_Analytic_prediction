import api from "./api";

// ==========================
// Get All Attendance
// ==========================
export const getAttendance = async () => {
  const response = await api.get("/attendance");
  return response.data;
};

// ==========================
// Get Single Attendance
// ==========================
export const getAttendanceById = async (attendanceId) => {
  const response = await api.get(`/attendance/${attendanceId}`);
  return response.data;
};

// ==========================
// Create Attendance
// ==========================
export const createAttendance = async (attendance) => {
  const response = await api.post("/attendance", attendance);
  return response.data;
};

// ==========================
// Update Attendance
// ==========================
export const updateAttendance = async (attendanceId, attendance) => {
  const response = await api.put(
    `/attendance/${attendanceId}`,
    attendance
  );

  return response.data;
};

// ==========================
// Delete Attendance
// ==========================
export const deleteAttendance = async (attendanceId) => {
  const response = await api.delete(
    `/attendance/${attendanceId}`
  );

  return response.data;
};

// ==========================
// Search Attendance
// ==========================
export const searchAttendance = async (query) => {
  const response = await api.get(
    `/attendance/search/?query=${query}`
  );

  return response.data;
};

// ==========================
// Filter By Student
// ==========================
export const filterAttendanceByStudent = async (studentId) => {
  const response = await api.get(
    `/attendance/filter/student/${studentId}`
  );

  return response.data;
};

// ==========================
// Filter By Course
// ==========================
export const filterAttendanceByCourse = async (courseId) => {
  const response = await api.get(
    `/attendance/filter/course/${courseId}`
  );

  return response.data;
};

// ==========================
// Filter By Status
// ==========================
export const filterAttendanceByStatus = async (status) => {
  const response = await api.get(
    `/attendance/filter/status/${status}`
  );

  return response.data;
};

// ==========================
// Filter By Date
// ==========================
export const filterAttendanceByDate = async (date) => {
  const response = await api.get(
    `/attendance/filter/date/${date}`
  );

  return response.data;
};

// ==========================
// Pagination
// ==========================
export const getAttendancePage = async (
  page = 1,
  limit = 10
) => {
  const response = await api.get(
    `/attendance/page?page=${page}&limit=${limit}`
  );

  return response.data;
};