import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { user: null, isAdmin: false };

  // admin_users has no public RLS policy by design, so check it with the server-only service client.
  const admin = createAdminClient();
  const { data, error: roleError } = await admin.from("admin_users")
    .select("user_id").eq("user_id", user.id).maybeSingle();
  return { user, isAdmin: !roleError && Boolean(data) };
}
