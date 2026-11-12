"use client";

import { useState } from "react";

export default function AdminCardRequestActions({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function update(nextStatus: "approved" | "rejected" | "revoked") {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/card-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not update request.");
      setMessage(result.message);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update request.");
    } finally {
      setBusy(false);
    }
  }

  return <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {status === "pending" ? <>
      <button type="button" className="btn btn-primary" disabled={busy} onClick={() => update("approved")}>Approve</button>
      <button type="button" className="btn btn-outline" disabled={busy} onClick={() => update("rejected")}>Reject</button>
    </> : status === "approved" ? <button type="button" className="btn btn-outline" disabled={busy} onClick={() => update("revoked")}>Revoke access</button> : <span className="muted">No action</span>}
    {message && <small className="muted">{message}</small>}
  </div>;
}
