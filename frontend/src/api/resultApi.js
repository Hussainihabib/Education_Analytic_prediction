import api from "./api";

// Get All Results
export const getResults = async () => {
  const response = await api.get("/results/");
  return response.data;
};

// Get Single Result
export const getResult = async (id) => {
  const response = await api.get(`/results/${id}`);
  return response.data;
};

// Add Result
export const createResult = async (data) => {
  const response = await api.post("/results/", data);
  return response.data;
};

// Update Result
export const updateResult = async (id, data) => {
  try {
    const response = await api.put(`/results/${id}`, data);
    return response.data;
  } catch (error) {
    console.log("UPDATE RESULT ERROR:", error.response?.data);
    console.log("SENT DATA:", data);
    throw error;
  }
};

// Delete Result
export const deleteResult = async (id) => {
  const response = await api.delete(`/results/${id}`);
  return response.data;
};

// Search
export const searchResults = async (query) => {
  const response = await api.get(
    `/results/search/?query=${query}`
  );
  return response.data;
};

// Filter Status
export const filterStatus = async (status) => {
  const response = await api.get(
    `/results/filter/status/${status}`
  );
  return response.data;
};

// Filter Semester
export const filterSemester = async (semester) => {
  const response = await api.get(
    `/results/filter/semester/${semester}`
  );
  return response.data;
};

// Filter Exam
export const filterExam = async (exam) => {
  const response = await api.get(
    `/results/filter/exam/${exam}`
  );
  return response.data;
};

// Pagination
export const paginateResults = async (
  page = 1,
  limit = 10
) => {
  const response = await api.get(
    `/results/page/?page=${page}&limit=${limit}`
  );
  return response.data;
};