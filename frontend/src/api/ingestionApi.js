import api from "./api";

// ==============================
// Allowed target collections + supported file formats
// GET /ingestion/collections (Admin only)
// ==============================
export const getIngestibleCollections = async () => {
  const response = await api.get("/ingestion/collections");
  return response.data;
};

// ==============================
// Upload a dataset file into a collection
// POST /ingestion/upload/{collection} (Admin only)
// ==============================
export const uploadDataset = async (collection, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    `/ingestion/upload/${collection}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    }
  );

  return response.data;
};

// ==============================
// Upload history (real audit trail)
// GET /ingestion/history (Admin only)
// ==============================
export const getIngestionHistory = async (limit = 50) => {
  const response = await api.get(`/ingestion/history?limit=${limit}`);
  return response.data;
};
