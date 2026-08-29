import api from "./api";

// ==============================
// Get All Teachers
// ==============================
export const getTeachers = async () => {
  const response = await api.get("/teachers/");
  return response.data;
};

// ==============================
// Get Single Teacher
// ==============================
export const getTeacher = async (id) => {
  const response = await api.get(`/teachers/${id}`);
  return response.data;
};

// ==============================
// Create Teacher
// ==============================
export const createTeacher = async (data) => {
  const response = await api.post("/teachers/", data);
  return response.data;
};

// ==============================
// Update Teacher
// ==============================
export const updateTeacher = async (id, data) => {
  const response = await api.put(`/teachers/${id}`, data);
  return response.data;
};

// ==============================
// Delete Teacher
// ==============================
export const deleteTeacher = async (id) => {
  const response = await api.delete(`/teachers/${id}`);
  return response.data;
};

// ==============================
// Search Teachers
// ==============================
export const searchTeachers = async (query) => {
  const response = await api.get(`/teachers/search/?query=${query}`);
  return response.data;
};

// ==============================
// Filter Department
// ==============================
export const filterDepartment = async (department) => {
  const response = await api.get(
    `/teachers/filter/department/${department}`
  );
  return response.data;
};

// ==============================
// Filter Designation
// ==============================
export const filterDesignation = async (designation) => {
  const response = await api.get(
    `/teachers/filter/designation/${designation}`
  );
  return response.data;
};

// ==============================
// Filter Status
// ==============================
export const filterStatus = async (status) => {
  const response = await api.get(
    `/teachers/filter/status/${status}`
  );
  return response.data;
};

// ==============================
// Pagination
// ==============================
export const paginateTeachers = async (
  page = 1,
  limit = 10
) => {
  const response = await api.get(
    `/teachers/page/?page=${page}&limit=${limit}`
  );

  return response.data;
};