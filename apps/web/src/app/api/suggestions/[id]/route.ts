import { NextResponse } from "next/server";
import { z } from "zod";
import { DEMO_SHARE_ID } from "@/lib/demo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const shareId = z.union([z.literal(DEMO_SHARE_ID), z.string().min(16)]);
const bodySchema = z.discriminatedUnion("status", [
  z.object({ shareId, status: z.literal("accepted") }),
  z.object({ shareId, status: z.literal("rejected") }),
  z.object({ shareId, status: z.literal("edited"), finalContent: z.string().min(1).max(20_000) }),
]);

/** Records the human decision on an AI draft. This is the feedback signal for future fine-tuning. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const body = parsed.data;
  if (body.shareId === DEMO_SHARE_ID) return NextResponse.json({ ok: true });
  const admin = getSupabaseAdmin();

  const { data: owned } = await admin
    .from("suggestions")
    .select("id, findings!inner(scans!inner(share_id))")
    .eq("id", id)
    .eq("findings.scans.share_id", body.shareId)
    .maybeSingle();
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await admin
    .from("suggestions")
    .update({
      status: body.status,
      final_content: body.status === "edited" ? body.finalContent : null,
      decided_by: user?.id ?? null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ error: "Could not save your decision." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
