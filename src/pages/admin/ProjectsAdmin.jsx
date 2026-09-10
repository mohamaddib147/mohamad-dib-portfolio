import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { STYLE_PRESETS, ICON_NAMES, CATEGORY_OPTIONS, findStyleKey } from "../../data/projectPresets";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";
import ImageUploader from "./ImageUploader";
import ProjectPreviewCard from "./ProjectPreviewCard";

const EMPTY_PROJECT_FORM = {
  title: "",
  meta: "",
  role: "",
  badge: "",
  styleKey: "software",
  category: "fullstack",
  iconName: "Cpu",
  link: "",
  demo_link: "",
  images: [],
  is_published: true,
  summary: "",
  description: "",
  highlights: "",
  tech: "",
  sort_order: 0,
};

const SUMMARY_LIMIT = 180;
const DESCRIPTION_LIMIT = 500;

function linesToArray(text) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

function arrayToLines(arr) {
  return (arr ?? []).join("\n");
}

function CharCount({ value, limit }) {
  const over = value.length > limit;
  return (
    <span className={`admin-char-count ${over ? "over" : ""}`}>
      {value.length} / {limit}
    </span>
  );
}

function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_PROJECT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = async () => {
    const { data, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order");
    if (fetchError) setError(fetchError.message);
    setProjects(data ?? []);
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
      demo_link: project.demo_link ?? "",
      images: project.image_urls ?? [],
      is_published: project.is_published ?? true,
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

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    const { error: deleteError } = await supabase.from("projects").delete().eq("id", id);
    if (deleteError) {
      setToast({ type: "error", message: deleteError.message });
    } else {
      setToast({ type: "success", message: "Project deleted." });
      refresh();
    }
  };

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= projects.length) return;

    const a = projects[index];
    const b = projects[otherIndex];

    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from("projects").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("projects").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);

    if (err1 || err2) {
      setToast({ type: "error", message: (err1 ?? err2).message });
    } else {
      refresh();
    }
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
      demo_link: form.demo_link || null,
      image_urls: form.images,
      is_published: form.is_published,
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

    setToast({ type: "success", message: editingId ? "Project updated." : "Project added." });
    cancelEdit();
    refresh();
  };

  return (
    <div className="admin-panel-grid admin-panel-grid-3">
      <div className="admin-list-card holo-card">
        <div className="holo-card-inner">
          <h3>Projects ({projects.length})</h3>
          {loading && <p className="contact-support-text">Loading…</p>}
          {!loading && projects.length === 0 && (
            <p className="contact-support-text">No projects yet — add one to the right.</p>
          )}
          <div className="admin-list">
            {projects.map((project, index) => (
              <div className="admin-list-item" key={project.id}>
                <div className="admin-list-reorder">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === projects.length - 1} aria-label="Move down">
                    <ArrowDown size={13} />
                  </button>
                </div>
                <div className="admin-list-body">
                  <p className="admin-list-title">
                    {project.title}
                    {!project.is_published && <span className="admin-draft-tag">Draft</span>}
                  </p>
                  <p className="admin-list-sub">
                    {project.category} · order {project.sort_order}
                  </p>
                </div>
                <div className="admin-list-actions">
                  <button type="button" onClick={() => startEdit(project)} aria-label={`Edit ${project.title}`}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(project.id)} aria-label={`Delete ${project.title}`}>
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
            </div>

            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Repository Link (optional)</label>
                <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://github.com/…" />
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Live Demo Link (optional)</label>
                <input value={form.demo_link} onChange={(e) => setForm({ ...form, demo_link: e.target.value })} placeholder="https://your-demo.vercel.app" />
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
              <label className="contact-mini-label">Images (first one shown as the card cover)</label>
              <ImageUploader value={form.images} onChange={(images) => setForm({ ...form, images })} />
            </div>

            <label className="admin-toggle-row">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
              <span>{form.is_published ? "Published — visible on the live site" : "Draft — hidden from the live site"}</span>
            </label>

            <div className="transmit-field">
              <div className="admin-field-label-row">
                <label className="contact-mini-label">Summary</label>
                <CharCount value={form.summary} limit={SUMMARY_LIMIT} />
              </div>
              <textarea rows={2} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>

            <div className="transmit-field">
              <div className="admin-field-label-row">
                <label className="contact-mini-label">Description</label>
                <CharCount value={form.description} limit={DESCRIPTION_LIMIT} />
              </div>
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

      <div className="admin-preview-card-wrap">
        <p className="admin-preview-label">Live Preview</p>
        <ProjectPreviewCard form={form} />
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this project?"
        message="This removes it permanently from the database. This can't be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}

export default ProjectsAdmin;
