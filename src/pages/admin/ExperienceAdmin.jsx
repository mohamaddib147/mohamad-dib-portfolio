import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";

const EMPTY_FORM = {
  company: "",
  role: "",
  location: "",
  period: "",
  highlights: "",
  sort_order: 0,
};

function linesToArray(text) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

function arrayToLines(arr) {
  return (arr ?? []).join("\n");
}

function ExperienceAdmin() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = async () => {
    const { data, error: fetchError } = await supabase
      .from("experience")
      .select("*")
      .order("sort_order");
    if (fetchError) setError(fetchError.message);
    setEntries(data ?? []);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      const { data, error: fetchError } = await supabase
        .from("experience")
        .select("*")
        .order("sort_order");
      if (cancelled) return;
      if (fetchError) setError(fetchError.message);
      setEntries(data ?? []);
      setLoading(false);
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const startEdit = (entry) => {
    setEditingId(entry.id);
    setForm({
      company: entry.company ?? "",
      role: entry.role ?? "",
      location: entry.location ?? "",
      period: entry.period ?? "",
      highlights: arrayToLines(entry.highlights),
      sort_order: entry.sort_order ?? 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    const { error: deleteError } = await supabase.from("experience").delete().eq("id", id);
    if (deleteError) {
      setToast({ type: "error", message: deleteError.message });
    } else {
      setToast({ type: "success", message: "Entry deleted." });
      refresh();
    }
  };

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= entries.length) return;

    const a = entries[index];
    const b = entries[otherIndex];

    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from("experience").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("experience").update({ sort_order: a.sort_order }).eq("id", b.id),
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

    const payload = {
      company: form.company,
      role: form.role,
      location: form.location,
      period: form.period,
      highlights: linesToArray(form.highlights),
      sort_order: Number(form.sort_order) || 0,
    };

    const { error: writeError } = editingId
      ? await supabase.from("experience").update(payload).eq("id", editingId)
      : await supabase.from("experience").insert(payload);

    if (writeError) {
      setError(writeError.message);
      return;
    }

    setToast({ type: "success", message: editingId ? "Entry updated." : "Entry added." });
    cancelEdit();
    refresh();
  };

  return (
    <div className="admin-panel-grid">
      <div className="admin-list-card holo-card">
        <div className="holo-card-inner">
          <h3>Experience ({entries.length})</h3>
          {loading && <p className="contact-support-text">Loading…</p>}
          {!loading && entries.length === 0 && (
            <p className="contact-support-text">No entries yet — add one on the right.</p>
          )}
          <div className="admin-list">
            {entries.map((entry, index) => (
              <div className="admin-list-item" key={entry.id}>
                <div className="admin-list-reorder">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === entries.length - 1} aria-label="Move down">
                    <ArrowDown size={13} />
                  </button>
                </div>
                <div className="admin-list-body">
                  <p className="admin-list-title">{entry.company}</p>
                  <p className="admin-list-sub">{entry.role} · order {entry.sort_order}</p>
                </div>
                <div className="admin-list-actions">
                  <button type="button" onClick={() => startEdit(entry)} aria-label={`Edit ${entry.company}`}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(entry.id)} aria-label={`Delete ${entry.company}`}>
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
          <h3>{editingId ? "Edit Experience" : "Add Experience"}</h3>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Company</label>
                <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="transmit-field">
                <label className="contact-mini-label">Role</label>
                <input required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
              </div>
              <div className="transmit-field">
                <label className="contact-mini-label">Period</label>
                <input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="May 2026 – Present" />
              </div>
            </div>

            <div className="transmit-field">
              <label className="contact-mini-label">Location</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Beirut, Lebanon · Hybrid" />
            </div>

            <div className="transmit-field">
              <label className="contact-mini-label">Highlights (one per line)</label>
              <textarea rows={5} value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} />
            </div>

            {error && <p className="tx-status-line tx-status-fail">✗ {error}</p>}

            <div className="admin-form-actions">
              <button type="submit" className="establish-btn">
                {editingId ? "Save Changes" : (<><Plus size={15} /> Add Experience</>)}
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

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this entry?"
        message="This removes it permanently from the database. This can't be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}

export default ExperienceAdmin;
