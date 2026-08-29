import api from "./api";

const REPORT_TYPES = {
  1: "student-performance",
  2: "dropout-risk",
  3: "department-analytics",
  4: "teacher-performance",
  5: "attendance-compliance",
  6: "ml-model-accuracy",
};

export async function downloadReport(reportId, format) {
  const type = REPORT_TYPES[reportId];
  if (!type) throw new Error("Unknown report type");

  const normalized = String(format).toLowerCase();

  const response = await api.get(`/reports/${type}/${normalized}`, {
    responseType: "blob",
  });

  const contentType = response.headers?.["content-type"] || "";
  if (contentType.includes("application/json")) {
    const text = await response.data.text();
    let message = "Report download failed.";
    try {
      const parsed = JSON.parse(text);
      message = parsed.detail || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const blob = new Blob([response.data], { type: contentType || "application/octet-stream" });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${type}.${normalized}`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export { REPORT_TYPES };
