import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("matches")
    .select("*, match_events(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ matches: data ?? [] });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = getSupabase();

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .insert({
      user_id: userId,
      competition_type: body.competitionType,
      game_length_minutes: body.gameLengthMinutes,
      player_count: body.playerCount ?? 0,
      total_subs: body.totalSubs ?? 0,
      ended_at: body.endedAt ?? null,
    })
    .select()
    .single();

  if (matchError) return NextResponse.json({ error: matchError.message }, { status: 500 });

  if (body.events && body.events.length > 0) {
    const eventRows = body.events.map((e: {
      eventType: string;
      minute: number;
      second: number;
      playerOutId?: string;
      playerInId?: string;
      playerOutName?: string;
      playerInName?: string;
    }) => ({
      match_id: match.id,
      event_type: e.eventType,
      minute: e.minute,
      second: e.second,
      player_out_id: e.playerOutId ?? null,
      player_in_id: e.playerInId ?? null,
      player_out_name: e.playerOutName ?? null,
      player_in_name: e.playerInName ?? null,
    }));

    await supabase.from("match_events").insert(eventRows);
  }

  return NextResponse.json({ match });
}
