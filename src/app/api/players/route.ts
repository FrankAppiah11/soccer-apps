import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ players: data ?? [] });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = getSupabase();
  const players = body.players as Array<{
    id: string;
    name: string;
    position: string;
    positionGroup: string;
    desiredMinutes: number | null;
    isInjured: boolean;
    isGK: boolean;
  }>;

  await supabase.from("players").delete().eq("user_id", userId);

  if (players.length === 0) {
    return NextResponse.json({ players: [] });
  }

  const rows = players.map((p, i) => ({
    id: p.id,
    user_id: userId,
    name: p.name,
    position: p.position,
    position_group: p.positionGroup,
    desired_minutes: p.desiredMinutes,
    is_injured: p.isInjured,
    is_gk: p.isGK,
    sort_order: i,
  }));

  const { data, error } = await supabase
    .from("players")
    .upsert(rows, { onConflict: "id" })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ players: data });
}
