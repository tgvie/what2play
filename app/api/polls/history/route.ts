import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAnonClient } from "@/utils/supabase/server";

// GET /api/polls/history -> Fetch user's poll history (created + participated)
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    // Must be authenticated
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

    // Fetch polls created by user
    const { data: createdPolls, error: createdError } = await supabase
      .from("polls")
      .select(`
        id,
        title,
        description,
        created_at,
        poll_games (id)
      `)
      .eq("creator_id", userId)
      .order("created_at", { ascending: false });

    if (createdError) {
      console.error("Created polls fetch error:", createdError);
    }

    // Fetch polls user has voted on (participated in)
    const { data: votedPolls, error: votedError } = await supabase
      .from("votes")
      .select(`
        poll_games (
          poll_id,
          polls (
            id,
            title,
            description,
            created_at,
            creator_id,
            profiles:creator_id (
              username
            )
          )
        )
      `)
      .eq("user_id", userId);

    if (votedError) {
      console.error("Voted polls fetch error:", votedError);
    }

    // Transform created polls
    const created = (createdPolls || []).map((poll) => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      created_at: poll.created_at,
      game_count: poll.poll_games?.length || 0,
    }));

    // Extract unique polls from votes (remove duplicates)
    const participatedMap = new Map();
    (votedPolls || []).forEach((vote) => {
      const pollData = vote.poll_games?.polls;
      if (pollData && !participatedMap.has(pollData.id)) {
        // Skip polls the user created (they'll be in the created list)
        if (pollData.creator_id !== userId) {
          const profiles = pollData.profiles;
          const creator = Array.isArray(profiles) ? profiles[0] : profiles;
          participatedMap.set(pollData.id, {
            id: pollData.id,
            title: pollData.title,
            description: pollData.description,
            created_at: pollData.created_at,
            creator_username: creator?.username || "Unknown",
          });
        }
      }
    });

    const participated = Array.from(participatedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      created,
      participated,
    });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
