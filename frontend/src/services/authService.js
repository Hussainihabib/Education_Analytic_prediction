import api from "../api/api";

export const loginAPI = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerAPI = (data) =>
  api.post("/auth/register", data);

export const currentUserAPI = () =>
  api.get("/auth/me");
