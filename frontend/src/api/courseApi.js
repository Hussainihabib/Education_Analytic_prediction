import api from "./api";

// ==============================
// Get All Courses
// ==============================
export const getCourses = async () => {
  const response = await api.get("/courses/");
  return response.data;
};

// ==============================
// Get Single Course
// ==============================
export const getCourse = async (courseCode) => {
  const response = await api.get(`/courses/${courseCode}`);
  return response.data;
};

// ==============================
// Create Course
// ==============================
export const createCourse = async (data) => {
  const response = await api.post("/courses/", data);
  return response.data;
};

// ==============================
// Update Course
// ==============================
export const updateCourse = async (courseCode, data) => {
  const response = await api.put(`/courses/${courseCode}`, data);
  return response.data;
};

// ==============================
// Delete Course
// ==============================
export const deleteCourse = async (courseCode) => {
  const response = await api.delete(`/courses/${courseCode}`);
  return response.data;
};

// ==============================
// Search Courses
// ==============================
export const searchCourses = async (query) => {
  const response = await api.get(`/courses/search/?query=${query}`);
  return response.data;
};

// ==============================
// Filter by Department
// ==============================
export const filterDepartment = async (department) => {
  const response = await api.get(
    `/courses/filter/department/${department}`
  );
  return response.data;
};

// ==============================
// Filter by Semester
// ==============================
export const filterSemester = async (semester) => {
  const response = await api.get(
    `/courses/filter/semester/${semester}`
  );
  return response.data;
};

// ==============================
// Filter by Status
// ==============================
export const filterStatus = async (status) => {
  const response = await api.get(
    `/courses/filter/status/${status}`
  );
  return response.data;
};

// ==============================
// Pagination
// ==============================
export const paginateCourses = async (
  page = 1,
  limit = 10
) => {
  const response = await api.get(
    `/courses/page/?page=${page}&limit=${limit}`
  );
  return response.data;
};