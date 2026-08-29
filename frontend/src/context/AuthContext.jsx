import { createContext, useContext, useEffect, useState } from "react";
import { loginAPI, registerAPI, currentUserAPI } from "../services/authService";
import { apiErrorMessage } from "../utils/validation";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; } catch { return null; }
  });

  const login = async ({ email, password }) => {
    try {
      const { data } = await loginAPI(email.trim().toLowerCase(), password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (error) {
      return { ok: false, error: apiErrorMessage(error, "Invalid Email or Password") };
    }
  };

  const signup = async (payload) => {
    try {
      const { data } = await registerAPI(payload);
      return { ok: true, data };
    } catch (error) {
      return { ok: false, error: apiErrorMessage(error, "Registration Failed") };
    }
  };

  const currentUser = async () => {
    try {
      const { data } = await currentUserAPI();
      const current = data.logged_in_user || data;
      setUser(current);
      localStorage.setItem("user", JSON.stringify(current));
      return current;
    } catch {
      logout();
      return null;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = (data) => {
    const updated = { ...(user || {}), ...data };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  useEffect(() => {
    if (!token) return;
    currentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token, user, login, signup, logout, currentUser, updateProfile,
      requestPasswordReset: async () => ({ ok: true }),
      resetPassword: async () => ({ ok: true }),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
