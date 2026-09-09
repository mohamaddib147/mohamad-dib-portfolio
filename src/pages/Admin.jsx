import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import ProjectsAdmin from "./admin/ProjectsAdmin";
import SkillsAdmin from "./admin/SkillsAdmin";
import ExperienceAdmin from "./admin/ExperienceAdmin";

// ── Login ───────────────────────────────────────────────────────────────
function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <p className="tx-endpoint-text">RESTRICTED — OPERATOR LOGIN</p>
        <h2>Admin Access</h2>

        <div className="transmit-field">
          <label className="contact-mini-label" htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="transmit-field">
          <label className="contact-mini-label" htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="tx-status-line tx-status-fail">✗ {error}</p>}

        <button type="submit" className="establish-btn" disabled={submitting}>
          {submitting ? "AUTHENTICATING…" : "LOG IN"}
        </button>
      </form>
    </div>
  );
}

const TABS = [
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
];

// ── Page ───────────────────────────────────────────────────────────────
function Admin() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [tab, setTab] = useState("projects");

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="admin-loading">
        Supabase isn't configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
      </div>
    );
  }

  if (session === undefined) {
    return <div className="admin-loading">Checking session…</div>;
  }

  if (!session) {
    return <AdminLogin />;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="tx-endpoint-text">OPERATOR CONSOLE</p>
          <h1>Content Admin</h1>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => supabase.auth.signOut()}>
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div className="project-filter-bar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`project-filter-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "projects" && <ProjectsAdmin />}
      {tab === "skills" && <SkillsAdmin />}
      {tab === "experience" && <ExperienceAdmin />}
    </div>
  );
}

export default Admin;
