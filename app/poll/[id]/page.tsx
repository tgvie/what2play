import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";
import CopyButton from "./CopyButton";

// Type definitions for poll data
type PollCreator = {
  id: string;
  username: string;
};

type PollGame = {
  id: string;
  igdb_id: number;
  title: string;
  cover_url: string | null;
  created_at: string;
};

// Displays poll details, games list, and shareable link
export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  // Fetch games added to this poll
  const { data: games } = await supabase
    .from("poll_games")
    .select("id, igdb_id, title, cover_url, created_at")
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

  // Extract creator from profiles (Supabase may return array or single object)
  const profilesData = poll.profiles;
  const creator: PollCreator | null = Array.isArray(profilesData)
    ? profilesData[0] || null
    : profilesData || null;
  const pollGames = (games || []) as PollGame[];

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl">
        {/* Poll Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {poll.description}
            </p>
          )}
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
            Created by{" "}
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {creator?.username || "Unknown"}
            </span>{" "}
            on {createdDate}
          </p>
        </div>

        {/* Shareable Link Card */}
        <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Share this poll
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareableUrl}
              readOnly
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <CopyButton url={shareableUrl} />
          </div>
        </div>

        {/* Games List Section */}
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Game Suggestions ({pollGames.length})
            </h2>
            {/* Add game button will go here later */}
          </div>

          {pollGames.length === 0 ? (
            // Empty state
            <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-500">
                No games suggested yet. Be the first to add one!
              </p>
              <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-600">
                (Game search coming soon)
              </p>
            </div>
          ) : (
            // Games grid
            <div className="grid gap-4 sm:grid-cols-2">
              {pollGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Link
            href="/create"
            className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Create another poll
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}

// Game card component for displaying a suggested game
function GameCard({ game }: { game: PollGame }) {
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Game cover image */}
      {game.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={game.cover_url}
          alt={`${game.title} cover`}
          className="h-20 w-14 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded bg-zinc-200 dark:bg-zinc-700">
          <span className="text-xs text-zinc-400">No img</span>
        </div>
      )}

      {/* Game info */}
      <div className="flex flex-col justify-center">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
          {game.title}
        </h3>
        {/* Vote count and button will go here later */}
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          (Voting coming soon)
        </p>
      </div>
    </div>
  );
}
