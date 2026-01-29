import Link from "next/link";
import { headers, cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, Dot } from "lucide-react";
import { createServerClient, createAnonClient } from "@/utils/supabase/server";
import CopyButton from "./CopyButton";
import PollGamesSection from "./PollGamesSection";

// Type definitions for poll data
type PollCreator = {
  id: string;
  username: string;
};

type Voter = {
  id: string | null;
  username: string;
};

type PollGame = {
  id: string;
  igdb_id: number;
  title: string;
  cover_url: string | null;
  created_at: string;
  vote_count: number;
  voters: Voter[];
};

// Displays poll details, games list, shareable link, search and add
export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Get current user from cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  let currentUserId: string | null = null;

  if (accessToken) {
    const anonClient = createAnonClient();
    const { data: userData } = await anonClient.auth.getUser(accessToken);
    if (userData?.user) {
      currentUserId = userData.user.id;
    }
  }

  // Fetch poll data from database
  const supabase = createServerClient();

  // Fetch poll with creator profile
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

  // Handle poll not found
  if (pollError || !poll) {
    notFound();
  }

  // Fetch games with vote data
  const { data: games } = await supabase
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

  // Build shareable URL
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const shareableUrl = `${protocol}://${host}/poll/${id}`;

  // Format date for display
  const createdDate = new Date(poll.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Extract creator from profiles
  const profilesData = poll.profiles;
  const creator: PollCreator | null = Array.isArray(profilesData)
    ? profilesData[0] || null
    : profilesData || null;

  // Transform games to include vote_count and voters
  const pollGames: PollGame[] = (games || []).map((game) => {
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

  return (
    <div className="min-h-screen px-4 py-8">
      <main className="mx-auto w-full max-w-2xl">
        {/* Back link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        {/* Poll Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="mt-2 text-secondary">
              {poll.description}
            </p>
          )}
          <p className="mt-2 flex items-center text-sm text-muted">
            Created by{" "}
            <span className="ml-1 font-medium text-secondary">
              {creator?.username || "Unknown"}
            </span>
            <Dot className="h-4 w-4" />
            {createdDate}
          </p>
        </div>

        {/* Shareable Link Card */}
        <div
          className="mb-6 rounded-xl border border-white/10 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px]"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        >
          <label className="mb-2 block text-sm font-medium text-secondary">
            Share this poll
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareableUrl}
              readOnly
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-primary"
            />
            <CopyButton url={shareableUrl} />
          </div>
        </div>

        {/* Games Section -> client component with add functionality */}
        <PollGamesSection
          pollId={id}
          initialGames={pollGames}
          currentUserId={currentUserId}
        />

        {/* Navigation */}
        <div className="flex justify-center border-t border-white/10 pt-6">
          <Link
            href="/create"
            className="text-sm text-pink underline underline-offset-4 hover:text-pink-light"
          >
            Create another poll
          </Link>
        </div>
      </main>
    </div>
  );
}
