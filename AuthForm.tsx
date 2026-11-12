"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = { redirectTo?: string };

export default function AuthForm({ redirectTo = "/portfolio" }: AuthFormProps) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setBusy(true);
    setMsg("Please wait…");
    const values = new FormData(form);
    const email = String(values.get("email") || "").trim();
    const password = String(values.get("password") || "");
    const name = String(values.get("name") || "").trim();
    const supabase = createClient();

    const result = mode === "in"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });

    setBusy(false);
    if (result.error) {
      setMsg(result.error.message);
      return;
    }
    if (mode === "in") {
      window.location.assign(redirectTo);
    } else {
      setMsg("Account created. Check your email if confirmation is enabled, then sign in before requesting a card.");
    }
  }

  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button type="button" className={`btn ${mode === "in" ? "btn-primary" : "btn-outline"}`} onClick={() => setMode("in")}>Sign In</button>
        <button type="button" className={`btn ${mode === "up" ? "btn-primary" : "btn-outline"}`} onClick={() => setMode("up")}>Sign Up</button>
      </div>
      <form className="form-stack" onSubmit={submit}>
        {mode === "up" && <div><label className="label">Your name</label><input className="field" name="name" required maxLength={120} /></div>}
        <div><label className="label">Email</label><input className="field" name="email" type="email" autoComplete="email" required /></div>
        <div><label className="label">Password</label><input className="field" name="password" type="password" autoComplete={mode === "in" ? "current-password" : "new-password"} minLength={8} required /></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign In" : "Create Account"}</button>
      </form>
      {msg && <p className="muted" role="status">{msg}</p>}
    </div>
  );
}
