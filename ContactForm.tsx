"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setStatus("Sending…");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      setStatus(result.message || "Please try again.");
      if (response.ok) form.reset();
    } catch {
      setStatus("Message could not be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form className="form-stack" onSubmit={submit}>
    <div><label className="label">Your name</label><input className="field" name="name" required maxLength={100} /></div>
    <div><label className="label">Email</label><input className="field" name="email" type="email" required maxLength={200} /></div>
    <div><label className="label">Message</label><textarea className="field" name="message" rows={5} required maxLength={5000} /></div>
    <button className="btn btn-primary" disabled={busy}>{busy ? "Sending…" : "Send message"}</button>
    {status && <p className="muted" role="status">{status}</p>}
  </form>;
}
