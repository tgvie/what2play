import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAnonClient } from "@/utils/supabase/server";

// POST /api/polls/[id]/games -> Add a game to a poll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pollId } = await params;
    const accessToken = request.cookies.get("access_token")?.value;

    // Must be authenticated to add games
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user's token
    const anonClient = createAnonClient();
    const { data: userData, error: userError } = await anonClient.auth.getUser(
      accessToken
    );

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // Parse request body
    const { igdb_id, title, cover_url } = await request.json();

    // Validate required inputs
    if (!igdb_id || !title) {
      return NextResponse.json(
        { error: "Game ID and title are required" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if poll exists
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select("id")
      .eq("id", pollId)
      .single();

    if (pollError || !poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      );
    }

    // Check if game already exists in this poll (duplicate prevention)
    const { data: existingGame } = await supabase
      .from("poll_games")
      .select("id")
      .eq("poll_id", pollId)
      .eq("igdb_id", igdb_id)
      .single();

    if (existingGame) {
      return NextResponse.json(
        { error: "This game has already been added to the poll" },
        { status: 409 }
      );
    }

    // Insert the game
    const { data: newGame, error: insertError } = await supabase
      .from("poll_games")
      .insert({
        poll_id: pollId,
        igdb_id: igdb_id,
        title: title,
        cover_url: cover_url || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Game insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to add game" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Game added successfully",
        game: newGame,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
