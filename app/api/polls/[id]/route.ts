import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

// GET /api/polls/[id] -> Fetch a poll by ID with its games and creator info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: "Invalid poll ID format" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Fetch poll with creator profile info
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .select(`
        id,
        title,
        description,
        created_at,
        creator_id,
        profiles:creator_id (
          id,
          username
        )
      `)
      .eq("id", id)
      .single();

    if (pollError || !poll) {
      // Check if it's a "not found" error
      if (pollError?.code === "PGRST116") {
        return NextResponse.json(
          { error: "Poll not found" },
          { status: 404 }
        );
      }
      console.error("Poll fetch error:", pollError);
      return NextResponse.json(
        { error: "Failed to fetch poll" },
        { status: 500 }
      );
    }

    // Fetch games added to this poll with vote counts and voters
    const { data: games, error: gamesError } = await supabase
      .from("poll_games")
      .select(`
        id,
        igdb_id,
        title,
        cover_url,
        created_at,
        votes (
          id,
          user_id,
          profiles:user_id (
            id,
            username
          )
        )
      `)
      .eq("poll_id", id)
      .order("created_at", { ascending: true });

    if (gamesError) {
      console.error("Games fetch error:", gamesError);
      // Continue without games rather than failing entirely
    }

    // Transform games to include vote_count and voters array
    const gamesWithVotes = (games || []).map((game) => {
      const votes = game.votes || [];
      return {
        id: game.id,
        igdb_id: game.igdb_id,
        title: game.title,
        cover_url: game.cover_url,
        created_at: game.created_at,
        vote_count: votes.length,
        voters: votes.map((vote: { profiles: { id: string; username: string }[] | { id: string; username: string } | null }) => {
          const profile = Array.isArray(vote.profiles) ? vote.profiles[0] : vote.profiles;
          return {
            id: profile?.id || null,
            username: profile?.username || "Unknown",
          };
        }),
      };
    });

    return NextResponse.json({
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        created_at: poll.created_at,
        creator: poll.profiles || null,
      },
      games: gamesWithVotes,
    });
  } catch (error) {
    console.error("Poll fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
