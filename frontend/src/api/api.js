// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://127.0.0.1:8000",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Automatically attach JWT token
// api.interceptors.request.use(
//   (config) => {

//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },

//   (error) => Promise.reject(error)
// );

// // Logout automatically if token expires
// api.interceptors.response.use(

//   (response) => response,

//   (error) => {

//     if (error.response?.status === 401) {

//       localStorage.removeItem("token");
//       localStorage.removeItem("user");

//       window.location.href="/login";
//     }

//     return Promise.reject(error);
//   }

// );

// export default api;


import axios from "axios";

const api = axios.create({
baseURL:
import.meta.env.VITE_API_BASE_URL ||
"http://127.0.0.1:8000",

headers: {
"Content-Type": "application/json",
},
});

// ==========================================
// Attach JWT Token
// ==========================================

api.interceptors.request.use(
(config) => {
const token = localStorage.getItem("token");

if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}

return config;

},

(error) => Promise.reject(error)
);

// ==========================================
// Handle Unauthorized
// ==========================================

api.interceptors.response.use(
(response) => response,

(error) => {
if (error.response?.status === 401) {
localStorage.removeItem("token");
localStorage.removeItem("user");

  window.location.href = "/login";
}

return Promise.reject(error);

}
);

// ==========================================
// STUDENT PERFORMANCE PREDICTION
// ==========================================

export const predictStudent = async (data) => {
const response = await api.post(
"/prediction",
data
);

return response.data;
};

// ==========================================
// NOTIFICATION APIs
// ==========================================

export const createNotification = async (data) => {
const response = await api.post(
"/notifications/",
data
);

return response.data;
};

export const getMyNotifications = async () => {
const response = await api.get(
"/notifications/my"
);

return response.data;
};

export const getAllNotifications = async () => {
const response = await api.get(
"/notifications/"
);

return response.data;
};

export const markNotificationRead = async (
notificationId
) => {
const response = await api.put(
`/notifications/${notificationId}`
);

return response.data;
};

export const deleteNotification = async (
notificationId
) => {
const response = await api.delete(
`/notifications/${notificationId}`
);

return response.data;
};

export const generateNotifications = async () => {
const response = await api.post(
"/notifications/generate"
);

return response.data;
};

// ==========================================
// SUPPORT APIs
// ==========================================

export const createSupportTicket = async (data) => {
const response = await api.post(
"/support/",
data
);

return response.data;
};

export const getMySupportTickets = async () => {
const response = await api.get(
"/support/my"
);

return response.data;
};

export const getAllSupportTickets = async () => {
const response = await api.get(
"/support/"
);

return response.data;
};

export const searchSupportTickets = async (
email = "",
status = "",
priority = "",
category = ""
) => {
const response = await api.get(
"/support/search",
{
params: {
email,
status,
priority,
category,
},
}
);

return response.data;
};

export const updateSupportStatus = async (
ticketId,
data
) => {
const response = await api.put(
`/support/${ticketId}`,
data
);

return response.data;
};

export const replySupportTicket = async (
ticketId,
data
) => {
const response = await api.put(
`/support/reply/${ticketId}`,
data
);

return response.data;
};

export const deleteSupportTicket = async (
ticketId
) => {
const response = await api.delete(
`/support/${ticketId}`
);

return response.data;
};

// ==========================================
// FEEDBACK
// ==========================================

export const createFeedback = async (data) => {
const response = await api.post(
"/support/",
{
...data,
category: "Feedback",
priority: "Low",
}
);

return response.data;
};

// ==========================================
// BUG REPORT
// ==========================================

export const createBugReport = async (data) => {
const response = await api.post(
"/support/",
{
...data,
category: "Bug",
}
);

return response.data;
};

// ==========================================
// Support aliases
// ==========================================

export const createSupport = createSupportTicket;

export const getMySupport = getMySupportTickets;

export const getAllSupport = getAllSupportTickets;

export const searchSupport = searchSupportTickets;

export const replySupport = replySupportTicket;

export const deleteSupport = deleteSupportTicket;

// ==========================================
// Export Axios
// ==========================================

export default api;





