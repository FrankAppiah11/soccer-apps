import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("game_configs")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ config: data });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = getSupabase();

  const existing = await supabase
    .from("game_configs")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing.data) {
    const { data, error } = await supabase
      .from("game_configs")
      .update({
        competition_type: body.competitionType,
        game_length_minutes: body.gameLengthMinutes,
        equal_playtime: body.equalPlaytime,
        sub_alerts: body.subAlerts,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.data.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ config: data });
  }

  const { data, error } = await supabase
    .from("game_configs")
    .insert({
      user_id: userId,
      competition_type: body.competitionType,
      game_length_minutes: body.gameLengthMinutes,
      equal_playtime: body.equalPlaytime,
      sub_alerts: body.subAlerts,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}
