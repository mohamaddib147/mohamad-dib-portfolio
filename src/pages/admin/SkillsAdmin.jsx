import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";

const EMPTY_SKILL_FORM = {
  title: "",
  items: "",
  sort_order: 0,
};

function linesToArray(text) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

function arrayToLines(arr) {
  return (arr ?? []).join("\n");
}

function SkillsAdmin() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_SKILL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = async () => {
    const { data, error: fetchError } = await supabase
      .from("skill_groups")
      .select("*")
      .order("sort_order");
    if (fetchError) setError(fetchError.message);
    setGroups(data ?? []);
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

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
    const { error: deleteError } = await supabase.from("skill_groups").delete().eq("id", id);
    if (deleteError) {
      setToast({ type: "error", message: deleteError.message });
    } else {
      setToast({ type: "success", message: "Skill group deleted." });
      refresh();
    }
  };

  const move = async (index, direction) => {
    const otherIndex = index + direction;
    if (otherIndex < 0 || otherIndex >= groups.length) return;

    const a = groups[index];
    const b = groups[otherIndex];

    const [{ error: err1 }, { error: err2 }] = await Promise.all([
      supabase.from("skill_groups").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("skill_groups").update({ sort_order: a.sort_order }).eq("id", b.id),
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

    setToast({ type: "success", message: editingId ? "Skill group updated." : "Skill group added." });
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
            {groups.map((group, index) => (
              <div className="admin-list-item" key={group.id}>
                <div className="admin-list-reorder">
                  <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up">
                    <ArrowUp size={13} />
                  </button>
                  <button type="button" onClick={() => move(index, 1)} disabled={index === groups.length - 1} aria-label="Move down">
                    <ArrowDown size={13} />
                  </button>
                </div>
                <div className="admin-list-body">
                  <p className="admin-list-title">{group.title}</p>
                  <p className="admin-list-sub">
                    {(group.items ?? []).length} items · order {group.sort_order}
                  </p>
                </div>
                <div className="admin-list-actions">
                  <button type="button" onClick={() => startEdit(group)} aria-label={`Edit ${group.title}`}>
                    <Pencil size={15} />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(group.id)} aria-label={`Delete ${group.title}`}>
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

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete this skill group?"
        message="This removes it permanently from the database. This can't be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}

export default SkillsAdmin;
