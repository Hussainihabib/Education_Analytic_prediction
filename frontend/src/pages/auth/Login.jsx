import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { validateEmail } from "../../utils/validation";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const emailError = validateEmail(email);

    if (emailError) {
      setError(emailError);
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    const res = await login({
      email,
      password,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    switch (res.user.role) {
      case "Admin":
        navigate("/app/admin");
        break;

      case "Teacher":
        navigate("/app/teacher");
        break;

      case "Student":
        navigate("/app/student");
        break;

      case "Analyst":
        navigate("/app/analyst");
        break;

      default:
        navigate("/login");
    }
  };

  return (
    <AuthLayout>
      <div className="eyebrow mb-2">
        Sign in
      </div>

      <h2 className="font-serif text-3xl font-bold mb-2 text-slate-900 dark:text-white">
        Welcome back
      </h2>

      {/* Demo Accounts */}
      <div className="mt-8 mb-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
        <h6 className="font-serif text-xl font-bold text-slate-900 dark:text-white mb-4">
          EduPredict Demo Login Accounts
        </h6>

        <div className="space-y-3 text-sm">
          {/* Administrator */}
          <div className="rounded-lg bg-white/80 p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              🛡 Administrator
            </p>

            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Email:{" "}
              <span className="font-medium">
                admin@edupredict.com
              </span>
            </p>

            <p className="text-slate-600 dark:text-slate-300">
              Password:{" "}
              <span className="font-medium">
                Admin@1234
              </span>
            </p>
          </div>

          {/* Teacher */}
          <div className="rounded-lg bg-white/80 p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              👨‍🏫 Teacher
            </p>

            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Email:{" "}
              <span className="font-medium">
                teacher2@edupredict.com
              </span>
            </p>

            <p className="text-slate-600 dark:text-slate-300">
              Password:{" "}
              <span className="font-medium">
                Teacher@1234
              </span>
            </p>
          </div>

          {/* Student */}
          <div className="rounded-lg bg-white/80 p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              🎓 Student
            </p>

            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Email:{" "}
              <span className="font-medium">
                student1@edupredict.com
              </span>
            </p>

            <p className="text-slate-600 dark:text-slate-300">
              Password:{" "}
              <span className="font-medium">
                Student@1234
              </span>
            </p>
          </div>

          {/* Analyst */}
          <div className="rounded-lg bg-white/80 p-3 border border-slate-100 dark:bg-slate-900 dark:border-slate-700">
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              📊 Analyst
            </p>

            <p className="text-slate-600 dark:text-slate-300 mt-1">
              Email:{" "}
              <span className="font-medium">
                analyst@edupredict.com
              </span>
            </p>

            <p className="text-slate-600 dark:text-slate-300">
              Password:{" "}
              <span className="font-medium">
                Analyst@1234
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
        Sign in using your EduPredict account.
      </p>

      {/* Login Form */}
      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
        {/* Email */}
        <div>
          <label className="label">
            Email
          </label>

          <input
            className="input"
            type="email"
            required
            value={email}
            placeholder="Enter Email"
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />
        </div>

        {/* Password */}
        <div>
          <label className="label">
            Password
          </label>

          <div className="relative">
            <input
              className="input pr-12"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              placeholder="Enter Password"
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
              title={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                /* Password visible → Click to hide */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 3l18 18"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.9 4.2A10.6 10.6 0 0 1 12 4c5.5 0 9.5 5.2 9.5 8s-1.3 3.7-3 5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.2 6.2C3.8 7.7 2.5 10.1 2.5 12c0 2.8 4 8 9.5 8 1.6 0 3.1-.4 4.3-1.1"
                  />
                </svg>
              ) : (
                /* Password hidden → Click to show */
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12S5.25 5.25 12 5.25 21.75 12 21.75 12 18.75 18.75 12 18.75 2.25 12 2.25 12Z"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 15.75A3.75 3.75 0 1 0 12 8.25a3.75 3.75 0 0 0 0 7.5Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300 p-3 text-sm">
            {error}
          </div>
        )}

        {/* Forgot Password */}
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading
            ? "Signing In..."
            : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
        Don't have an account?{" "}

        <Link
          to="/signup"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
}