import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await getSupabaseAdmin()
    .from("scans")
    .select("status, error")
    .eq("share_id", id)
    .maybeSingle<{ status: string; error: string | null }>();
  if (error) return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data, { headers: { "cache-control": "no-store" } });
}
