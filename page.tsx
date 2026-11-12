import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function GoldCardPortal() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const admin = createAdminClient();
  const { data } = await admin.from("card_requests")
    .select("id,status,card_type").eq("user_id", user.id)
    .eq("card_type", "gold").eq("status", "approved").limit(1).maybeSingle();
  if (!data) redirect("/card-access");

  return <main className="page"><div className="container">
    <span className="eyebrow gold">Verified Gold Card Member</span>
    <h1 className="page-title">Private Gold Card Portal</h1>
    <p className="lead">Your Gold Card access is active. This private area is separate from the administrator dashboard.</p>
    <div className="section card"><h2>Access confirmed</h2><p className="muted">Your account has an approved Gold Card request.</p><Link className="btn btn-outline" href="/portfolio">Return to website</Link></div>
  </div></main>;
}
