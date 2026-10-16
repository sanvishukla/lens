import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, hashIp, scanLimitReached } from "@/lib/rate-limit";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("url"), url: z.url({ protocol: /^https?$/ }) }),
  z.object({ kind: z.literal("html"), html: z.string().min(1).max(200_000) }),
]);

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a full URL starting with http:// or https://, or paste some HTML." }, { status: 400 });
  }

  const ipHash = hashIp(clientIp(request));
  if (await scanLimitReached(ipHash)) {
    return NextResponse.json({ error: "Too many scans from your network. Try again in an hour." }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const input = parsed.data;
  const { data, error } = await getSupabaseAdmin()
    .from("scans")
    .insert({
      kind: input.kind,
      url: input.kind === "url" ? input.url : null,
      html: input.kind === "html" ? input.html : null,
      user_id: user?.id ?? null,
      ip_hash: ipHash,
    })
    .select("share_id")
    .single<{ share_id: string }>();
  if (error) return NextResponse.json({ error: "Could not start the scan." }, { status: 500 });

  return NextResponse.json({ shareId: data.share_id }, { status: 201 });
}
