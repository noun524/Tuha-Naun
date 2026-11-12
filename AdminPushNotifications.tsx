"use client";

import { useState } from "react";

function decodeKey(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export default function AdminPushNotifications() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      setMessage("Push notifications are not configured yet. Add the VAPID keys to your hosting environment.");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setMessage("This browser does not support web push notifications.");
      return;
    }
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Notification permission was not granted.");
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription() || await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeKey(publicKey),
      });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not enable notifications.");
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="card" style={{ marginBottom: 20 }}>
    <strong>Mobile / browser notifications</strong>
    <p className="muted">Enable notifications on this administrator device to receive new card-request alerts. HTTPS and VAPID keys are required.</p>
    <button className="btn btn-outline" type="button" onClick={enable} disabled={busy}>{busy ? "Enabling…" : "Enable notifications on this device"}</button>
    {message && <p className="muted" role="status">{message}</p>}
  </div>;
}
