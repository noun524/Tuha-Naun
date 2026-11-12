"use client";

import { useState } from "react";

type Project = { id: string; title: string; description: string | null; category: string | null; image_url: string | null; is_published: boolean | null };
const empty = { title: "", description: "", category: "Logo Design", image_url: "", is_published: false };

export default function AdminProjectManager({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function edit(project: Project) {
    setEditingId(project.id);
    setForm({ title: project.title, description: project.description || "", category: project.category || "Logo Design", image_url: project.image_url || "", is_published: Boolean(project.is_published) });
    setStatus("");
  }

  function reset() { setEditingId(null); setForm(empty); }

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setStatus("Saving project…");
    try {
      const response = await fetch("/api/admin/projects", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, id: editingId } : form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not save project.");
      setStatus(result.message);
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save project.");
    } finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this portfolio project?")) return;
    setBusy(true); setStatus("Deleting project…");
    try {
      const response = await fetch("/api/admin/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not delete project.");
      setProjects((current) => current.filter((project) => project.id !== id));
      if (editingId === id) reset();
      setStatus(result.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not delete project.");
    } finally { setBusy(false); }
  }

  return <div className="grid">
    <form className="card form-stack" onSubmit={save}>
      <h3>{editingId ? "Edit Portfolio Project" : "Add Portfolio Project"}</h3>
      <div><label className="label">Project title</label><input className="field" required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div><label className="label">Category</label><input className="field" maxLength={100} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
      <div><label className="label">Description</label><textarea className="field" rows={3} maxLength={3000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div><label className="label">Image URL (optional)</label><input className="field" type="url" maxLength={2000} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" /></div>
      <label className="muted"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publish on public Portfolio page</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : editingId ? "Save Changes" : "Add Project"}</button>{editingId && <button type="button" className="btn btn-outline" onClick={reset}>Cancel</button>}</div>
      {status && <p className="muted" role="status">{status}</p>}
    </form>
    <div className="card"><h3>Existing Projects ({projects.length})</h3>
      {projects.length ? projects.map((project) => <article key={project.id} style={{ padding: "14px 0", borderBottom: "1px solid var(--border, #333)" }}>
        <strong>{project.title}</strong><p className="muted">{project.category || "Logo Design"} · {project.is_published ? "Published" : "Draft"}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><button type="button" className="btn btn-outline" disabled={busy} onClick={() => edit(project)}>Edit</button><button type="button" className="btn btn-outline" disabled={busy} onClick={() => remove(project.id)}>Delete</button></div>
      </article>) : <p className="muted">No projects have been added yet.</p>}
    </div>
  </div>;
}
