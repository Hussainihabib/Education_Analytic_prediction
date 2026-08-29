import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import RoleCard from "../../components/RoleCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { validateEmail, validateName, validatePassword, validateIdentifier } from "../../utils/validation";

const ROLES = [
  { id: "Teacher", icon: "☰", title: "Teacher", subtitle: "Track class progress" },
  { id: "Student", icon: "🎓", title: "Student", subtitle: "View your own outlook" },
  { id: "Analyst", icon: "📊", title: "Analyst", subtitle: "Model & data pipelines" },
];

export default function Signup() {
  const [role, setRole] = useState("Student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [identityId, setIdentityId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault(); setError("");
    const checks = [validateName(name, "Name"), validateEmail(email), validatePassword(password)];
    if (checks.find(Boolean)) { setError(checks.find(Boolean)); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (role === "Teacher" || role === "Student") {
      const idError = validateIdentifier(identityId, `${role} ID`);
      if (idError) { setError(idError); return; }
    }

    setLoading(true);
    const payload = {
      name: name.trim(), email: email.trim().toLowerCase(), password, role,
      teacher_id: role === "Teacher" ? identityId.trim().toUpperCase() : null,
      student_id: role === "Student" ? identityId.trim().toUpperCase() : null,
    };
    const res = await signup(payload);
    setLoading(false);
    if (!res.ok) { setError(res.error); return; }
    navigate("/login", { state: { message: "Account created successfully. Please sign in." } });
  };

  return <AuthLayout>
    <div className="eyebrow mb-2">Sign up</div>
    <h2 className="font-serif text-3xl font-bold mb-1.5">Create your account</h2>
    <p className="text-sm text-slate-500 mb-6">Select the role that matches your institution access.</p>
    <div className="grid grid-cols-2 gap-3 mb-6 md:grid-cols-3">
      {ROLES.map(r => <RoleCard key={r.id} icon={r.icon} title={r.title} subtitle={r.subtitle} active={role === r.id} onClick={() => { setRole(r.id); setIdentityId(""); setError(""); }} />)}
    </div>
    <form onSubmit={onSubmit} className="space-y-4">
      <div><label className="label">Full name</label><input className="input" required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" /></div>
      <div><label className="label">Email address</label><input className="input" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@institution.edu" /></div>
      {(role === "Teacher" || role === "Student") && <div><label className="label">{role} ID</label><input className="input" required value={identityId} onChange={e => setIdentityId(e.target.value.toUpperCase())} placeholder={role === "Teacher" ? "T00001" : "S000001"} /><p className="text-xs text-slate-400 mt-1">The ID must already exist and the email must match that record.</p></div>}
      <div className="grid grid-cols-2 gap-3"><div><label className="label">Password</label><input className="input" type="password" required value={password} onChange={e => setPassword(e.target.value)} /></div><div><label className="label">Confirm</label><input className="input" type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} /></div></div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</div>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? "Creating account…" : "Create account"}</button>
    </form>
    <p className="text-center text-sm text-slate-500 mt-6">Already have an account? <Link to="/login" className="text-navy-900 font-medium hover:underline">Sign in</Link></p>
  </AuthLayout>;
}
