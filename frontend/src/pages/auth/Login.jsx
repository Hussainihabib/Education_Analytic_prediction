import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import RoleCard from "../../components/RoleCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { validateEmail, apiErrorMessage } from "../../utils/validation";

const ROLES = [
  {
    id: "admin",
    icon: "🛡",
    title: "Administrator",
    subtitle: "Manage users & access",
  },
  {
    id: "teacher",
    icon: "👨‍🏫",
    title: "Teacher",
    subtitle: "Track class progress",
  },
  {
    id: "student",
    icon: "🎓",
    title: "Student",
    subtitle: "View your own outlook",
  },
  {
    id: "analyst",
    icon: "📊",
    title: "Analyst",
    subtitle: "Model & data pipelines",
  },
];

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    setError("");
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    if (!password) { setError("Password is required."); return; }
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

    switch(res.user.role){

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

      }
  };

  return (
    <AuthLayout>
      <div className="eyebrow mb-2">
        Sign in
      </div>

      <h2 className="font-serif text-3xl font-bold mb-1.5">
        Welcome back
      </h2>
         <h6 className="font-serif text-4l l:text-[42px] leading-tight font-bold mt-16 max-w-md">
            EduPredict Demo Login Accounts 
            
          </h6>

          <p className="text-sm text-slate-500 mb-6">
            Email: "admin@edupredict.com" & Password: "Admin@1234"
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Email: "teacher2@edupredict.com" & Password: "Teacher@1234"
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Email: "student1@edupredict.com" & Password: "Student@1234"
          </p>
          <p className="text-sm text-slate-500 mb-6">
            Email: "analyst@edupredict.com" & Password: "Analyst@1234"
          </p>
      <p className="text-sm text-slate-500 mb-6">
        Sign in using your EduPredict account.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {ROLES.map((r) => (
          <RoleCard
            key={r.id}
            icon={r.icon}
            title={r.title}
            subtitle={r.subtitle}
            active={role === r.id}
            onClick={() => setRole(r.id)}
          />
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4"
      >
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

        <div>
          <label className="label">
            Password
          </label>

          <input
            className="input"
            type="password"
            required
            value={password}
            placeholder="Enter Password"
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 p-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-slate-500 hover:text-blue-600"
          >
            Forgot Password?
          </Link>
        </div>

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

      <p className="text-center text-sm text-slate-500 mt-6">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="text-blue-600 hover:underline"
        >
          Create Account
        </Link>
      </p>
    </AuthLayout>
  );
}