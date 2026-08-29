import api from "./api";

// ============================================================
// EXISTING — DO NOT CHANGE
// ============================================================

export const getMLStatus = async () => {
  const response = await api.get("/prediction/status");
  return response.data;
};

export const retrainMLModels = async () => {
  const response = await api.post("/prediction/retrain");
  return response.data;
};

export const predictStudentFromDatabase = async (studentId) => {
  const response = await api.post(
    `/prediction/student/${encodeURIComponent(studentId)}`
  );
  return response.data;
};

export const predictStudent = async (data) => {
  const response = await api.post("/prediction/", data);
  return response.data;
};

// ============================================================
// NEW — DROPOUT
// ============================================================

export const predictDropout = async (data) => {
  const response = await api.post("/prediction/dropout", data);
  return response.data;
};

// ============================================================
// NEW — COURSE DEMAND
// ============================================================

export const predictCourseDemand = async (data) => {
  const response = await api.post("/prediction/course-demand", data);
  return response.data;
};

// ============================================================
// NEW — ANOMALY
// ============================================================

export const getAnomalyResults = async (limit = 20) => {
  const response = await api.get("/prediction/anomalies");
  return response.data;
};

// ============================================================
// NEW — CORRELATION
// ============================================================

export const getCorrelation = async () => {
  const response = await api.get("/prediction/correlation");
  return response.data;
};

// ============================================================
// NEW — TREND
// ============================================================

export const getTrend = async () => {
  const response = await api.get("/prediction/trend");
  return response.data;
};



// import api from "./api";

// // ===============================
// // ML STATUS
// // ===============================

// export const getMLStatus = async () => {
//   const response = await api.get("/prediction/status");
//   return response.data;
// };


// // ===============================
// // RETRAIN ALL ML MODELS
// // ===============================

// export const retrainMLModels = async () => {
//   const response = await api.post("/prediction/retrain");
//   return response.data;
// };


// // ===============================
// // STUDENT PERFORMANCE
// // ===============================

// export const predictStudentFromDatabase = async (studentId) => {
//   const response = await api.post(
//     `/prediction/student/${encodeURIComponent(studentId)}`
//   );
//   return response.data;
// };

// export const predictStudent = async (data) => {
//   const response = await api.post("/prediction/", data);
//   return response.data;
// };


// // ===============================
// // DROPOUT PREDICTION
// // ===============================

// export const predictDropout = async (data) => {
//   const response = await api.post("/prediction/dropout", data);
//   return response.data;
// };


// // ===============================
// // COURSE DEMAND
// // ===============================

// export const predictCourseDemand = async (data) => {
//   const response = await api.post("/prediction/course-demand", data);
//   return response.data;
// };


// // ===============================
// // ANOMALY DETECTION
// // Backend: GET /prediction/anomal
// // ===============================

// export const getAnomalyResults = async () => {
//   const response = await api.get("/prediction/anomal");
//   return response.data;
// };


// // ===============================
// // CORRELATION
// // Backend: GET /prediction/correlation
// // ===============================

// export const getCorrelation = async () => {
//   const response = await api.get("/prediction/correlation");
//   return response.data;
// };


// // ===============================
// // TREND
// // Backend: GET /prediction/trend
// // ===============================

// export const getTrend = async () => {
//   const response = await api.get("/prediction/trend");
//   return response.data;
// };

