import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAnonClient } from "@/utils/supabase/server";

// POST /api/polls/[id]/games/[gameId]/vote -> Toggle vote on a game
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; gameId: string }> }
) {
  try {
    const { id: pollId, gameId } = await params;
    const accessToken = request.cookies.get("access_token")?.value;

    // Must be authenticated to vote
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

    const userId = userData.user.id;
    const supabase = createServerClient();

    // Verify the game exists and belongs to this poll
    const { data: game, error: gameError } = await supabase
      .from("poll_games")
      .select("id, poll_id")
      .eq("id", gameId)
      .eq("poll_id", pollId)
      .single();

    if (gameError || !game) {
      return NextResponse.json(
        { error: "Game not found in this poll" },
        { status: 404 }
      );
    }

    // Check if user already voted for this game
    const { data: existingVote } = await supabase
      .from("votes")
      .select("id")
      .eq("poll_game_id", gameId)
      .eq("user_id", userId)
      .single();

    if (existingVote) {
      // Remove the vote (toggle off)
      const { error: deleteError } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);

      if (deleteError) {
        console.error("Vote delete error:", deleteError);
        return NextResponse.json(
          { error: "Failed to remove vote" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Vote removed",
        voted: false,
      });
    } else {
      // Add a vote
      const { error: insertError } = await supabase
        .from("votes")
        .insert({
          poll_game_id: gameId,
          user_id: userId,
        });

      if (insertError) {
        console.error("Vote insert error:", insertError);
        return NextResponse.json(
          { error: "Failed to add vote" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: "Vote added",
        voted: true,
      });
    }
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
