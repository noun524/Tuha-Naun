 "use client";
import { createClient } from "@/lib/supabase/client";
export default function SignOut(){return <button className="btn btn-outline" onClick={async()=>{const s=createClient();await s.auth.signOut();location.href="/";}}>Sign out</button>}