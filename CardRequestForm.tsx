"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CardRequestForm() {
  const [kind, setKind] = useState("royal");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setStatus("Checking your account…");
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setBusy(false);
      setStatus("Please create an account or sign in before requesting a card.");
      return;
    }

    setStatus("Submitting request…");
    try {
      const payload = new FormData(form);
      payload.set("card_type", kind);
      const response = await fetch("/api/card-request", { method: "POST", body: payload });
      const result = await response.json().catch(() => ({}));
      setStatus(result.message || "Please try again.");
      if (response.ok) form.reset();
    } catch {
      setStatus("Could not submit the request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <button type="button" className={`card ${kind === "royal" ? "" : "muted"}`} style={{ borderColor: kind === "royal" ? "var(--pink)" : "" }} onClick={() => setKind("royal")}>
          <strong className="pink">ROYAL CARD</strong><p className="muted">Admin access after your approval</p>
        </button>
        <button type="button" className={`card ${kind === "gold" ? "" : "muted"}`} style={{ borderColor: kind === "gold" ? "var(--gold)" : "" }} onClick={() => setKind("gold")}>
          <strong className="gold">GOLD CARD</strong><p className="muted">Password + admin approval</p>
        </button>
      </div>
      <div><label className="label">Full name</label><input className="field" name="full_name" required maxLength={120} /></div>
      <div><label className="label">Email (use the same email as your account)</label><input className="field" name="email" type="email" required maxLength={200} /></div>
      <div><label className="label">Phone (optional)</label><input className="field" name="phone" maxLength={40} /></div>
      <div><label className="label">Why are you requesting access?</label><textarea className="field" name="reason" rows={3} maxLength={1000} /></div>
      {kind === "gold" && <div><label className="label">Gold Card password</label><input className="field" name="gold_password" type="password" required minLength={8} autoComplete="off" /></div>}
      <label className="muted" style={{ fontSize: 12 }}><input type="checkbox" name="consent" value="yes" required /> I agree that my submitted information will be used to review this access request.</label>
      <button className="btn btn-primary" disabled={busy}>{busy ? "Submitting…" : "Request Access"}</button>
      {status && <div className="notice" role="status">{status}</div>}
    </form>
  );
}
