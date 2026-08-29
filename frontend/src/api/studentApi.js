import api from "./api";

export const getStudents = async () => {
  const response = await api.get("/students/");
  return response.data;
};

export const getStudent = async (id) => {
  const response = await api.get(`/students/${id}`);ac
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post("/students/", data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const searchStudents = async (query) => {
  const response = await api.get(`/students/search/?query=${query}`);
  return response.data;
};

export const filterDepartment = async (department) => {
  const response = await api.get(`/students/filter/department/${department}`);
  return response.data;
};

export const filterSemester = async (semester) => {
  const response = await api.get(`/students/filter/semester/${semester}`);
  return response.data;
};

export const filterStatus = async (status) => {
  const response = await api.get(`/students/filter/status/${status}`);
  return response.data;
};

export const paginateStudents = async (page = 1, limit = 10) => {
  const response = await api.get(`/students/page/?page=${page}&limit=${limit}`);
  return response.data;
};