import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  endpoint: z.string().url().max(3000),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
  expirationTime: z.number().nullable().optional(),
});

export async function POST(request: Request) {
  const { user, isAdmin } = await requireAdmin();
  if (!user || !isAdmin) return NextResponse.json({ message: "Administrator access required." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid push subscription." }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert({
    user_id: user.id,
    endpoint: parsed.data.endpoint,
    subscription: parsed.data,
  }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ message: "Could not save notification settings." }, { status: 500 });
  return NextResponse.json({ message: "Admin notifications enabled on this device." });
}
