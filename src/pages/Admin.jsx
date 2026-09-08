import { useEffect, useState } from "react";
import { LogOut, Pencil, Trash2, Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import {
  STYLE_PRESETS,
  ICON_NAMES,
  CATEGORY_OPTIONS,
  findStyleKey,
} from "../data/projectPresets";

const EMPTY_PROJECT_FORM = {
  title: "",
  meta: "",
  role: "",
  badge: "",
  styleKey: "software",
  category: "fullstack",
  iconName: "Cpu",
  link: "",
  summary: "",
  description: "",
  highlights: "",
  tech: "",
  sort_order: 0,
};

const EMPTY_SKILL_FORM = {
  title: "",
  items: "",
  sort_order: 0,
};

function linesToArray(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function arrayToLines(arr) {
  return (arr ?? []).join("\n");
}

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

// ── Projects admin ─────────────────────────────────────────────────────
function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_PROJECT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    const { data, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order");
    if (fetchError) setError(fetchError.message);
    setProjects(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order");
      if (cancelled) return;
      if (fetchError) setError(fetchError.message);
      setProjects(data ?? []);
      setLoading(false);
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const startEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title ?? "",
      meta: project.meta ?? "",
      role: project.role ?? "",
      badge: project.badge ?? "",
      styleKey: findStyleKey({
        accent: project.accent,
        layout: project.layout,
        projectType: project.project_type,
      }),
      category: project.category ?? "fullstack",
      iconName: project.icon_name ?? "Cpu",
      link: project.link ?? "",
      summary: project.summary ?? "",
      description: project.description ?? "",
      highlights: arrayToLines(project.highlights),
      tech: arrayToLines(project.tech),
      sort_order: project.sort_order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_PROJECT_FORM);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else refresh();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const preset = STYLE_PRESETS[form.styleKey];
    const payload = {
      title: form.title,
      meta: form.meta,
      role: form.role,
      badge: form.badge,
      accent: preset.accent,
      layout: preset.layout,
      project_type: preset.projectType,
      category: form.category,
      icon_name: form.iconName,
      link: form.link || null,
      summary: form.summary,
      description: form.description,
      highlights: linesToArray(form.highlights),
      tech: linesToArray(form.tech),
      sort_order: Number(form.sort_order) || 0,
    };

    const { error: writeError } = editingId
      ? await supabase.from("projects").update(payload).eq("id", editingId)
      : await supabase.from("projects").insert(payload);

    if (writeError) {
      setError(writeError.message);
      return;
    }

    cancelEdit();
    refresh();
  };

  return (
    <div className="admin-panel-grid">
      <div className="admin-list-card holo-card">
        <div className="holo-card-inner">
          <h3>Projects ({projects.length})</h3>
          {loading && <p className="contact-support-text">Loading…</p>}
          {!loading && projects.length === 0 && (
            <p className="contact-support-text">No projects yet — add one on the right.</p>
          )}
          <div className="admin-list">
            {projects.map((project) => (
              <div className="admin-list-item" key={project.id}>
                <div>
                  <p className="admin-list-title">{project.title}</p>
                  <p className="admin-list-sub">
                    {project.category} · order {project.sort_order}
                  </p>
                </div>
                <div className="admin-list-actions">
                  <button type="button" onClick={() => startEdit(project)} aria-label={`Edit ${project.title}`}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => handleDelete(project.id)} aria-label={`Delete ${project.title}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-form-card holo-card">
        <div className="holo-card-inner">
          <h3>{editingId ? "Edit Project" : "Add Project"}</h3>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Meta line</label>
                <input value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="Full-Stack Web Application · 2026" />
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Role</label>
                <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Badge</label>
                <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Featured · Full-Stack" />
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Link (optional)</label>
                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://github.com/…" />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Visual Style</label>
                <select value={form.styleKey} onChange={(e) => setForm({ ...form, styleKey: e.target.value })}>
                  {Object.entries(STYLE_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.label}</option>
                  ))}
                </select>
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Icon</label>
                <select value={form.iconName} onChange={(e) => setForm({ ...form, iconName: e.target.value })}>
                  {ICON_NAMES.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="transmit-field">
              <label className="contact-mini-label">Summary</label>
              <textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>

            <div className="transmit-field">
              <label className="contact-mini-label">Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="transmit-field">
              <label className="contact-mini-label">Highlights (one per line)</label>
              <textarea rows={4} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
            </div>

            <div className="transmit-field">
              <label className="contact-mini-label">Tech tags (one per line)</label>
              <textarea rows={3} value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} />
            </div>

            {error && <p className="tx-status-line tx-status-fail">✗ {error}</p>}

            <div className="admin-form-actions">
              <button type="submit" className="establish-btn">
                {editingId ? "Save Changes" : (<><Plus size={15} /> Add Project</>)}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Skills admin ───────────────────────────────────────────────────────
function SkillsAdmin() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_SKILL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const refresh = async () => {
    const { data, error: fetchError } = await supabase
      .from("skill_groups")
      .select("*")
      .order("sort_order");
    if (fetchError) setError(fetchError.message);
    setGroups(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const { data, error: fetchError } = await supabase
        .from("skill_groups")
        .select("*")
        .order("sort_order");
      if (cancelled) return;
      if (fetchError) setError(fetchError.message);
      setGroups(data ?? []);
      setLoading(false);
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const startEdit = (group) => {
    setEditingId(group.id);
    setForm({
      title: group.title ?? "",
      items: arrayToLines(group.items),
      sort_order: group.sort_order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_SKILL_FORM);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill group? This can't be undone.")) return;
    const { error: deleteError } = await supabase.from("skill_groups").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else refresh();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      title: form.title,
      items: linesToArray(form.items),
      sort_order: Number(form.sort_order) || 0,
    };

    const { error: writeError } = editingId
      ? await supabase.from("skill_groups").update(payload).eq("id", editingId)
      : await supabase.from("skill_groups").insert(payload);

    if (writeError) {
      setError(writeError.message);
      return;
    }

    cancelEdit();
    refresh();
  };

  return (
    <div className="admin-panel-grid">
      <div className="admin-list-card holo-card">
        <div className="holo-card-inner">
          <h3>Skill Groups ({groups.length})</h3>
          {loading && <p className="contact-support-text">Loading…</p>}
          {!loading && groups.length === 0 && (
            <p className="contact-support-text">No skill groups yet — add one on the right.</p>
          )}
          <div className="admin-list">
            {groups.map((group) => (
              <div className="admin-list-item" key={group.id}>
                <div>
                  <p className="admin-list-title">{group.title}</p>
                  <p className="admin-list-sub">
                    {(group.items ?? []).length} items · order {group.sort_order}
                  </p>
                </div>
                <div className="admin-list-actions">
                  <button type="button" onClick={() => startEdit(group)} aria-label={`Edit ${group.title}`}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => handleDelete(group.id)} aria-label={`Delete ${group.title}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-form-card holo-card">
        <div className="holo-card-inner">
          <h3>{editingId ? "Edit Skill Group" : "Add Skill Group"}</h3>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Wireless & Networking" />
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>

            <div className="transmit-field">
              <label className="contact-mini-label">Skills (one per line)</label>
              <textarea rows={8} value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} />
            </div>

            {error && <p className="tx-status-line tx-status-fail">✗ {error}</p>}

            <div className="admin-form-actions">
              <button type="submit" className="establish-btn">
                {editingId ? "Save Changes" : (<><Plus size={15} /> Add Skill Group</>)}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

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
        <button
          type="button"
          className={`project-filter-tab ${tab === "projects" ? "active" : ""}`}
          onClick={() => setTab("projects")}
        >
          Projects
        </button>
        <button
          type="button"
          className={`project-filter-tab ${tab === "skills" ? "active" : ""}`}
          onClick={() => setTab("skills")}
        >
          Skills
        </button>
      </div>

      {tab === "projects" ? <ProjectsAdmin /> : <SkillsAdmin />}
    </div>
  );
}

export default Admin;
