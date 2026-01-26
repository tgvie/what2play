import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createServerClient } from "@/utils/supabase/server";
import CopyButton from "./CopyButton";
import PollGamesSection from "./PollGamesSection";

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

// Displays poll details, games list, shareable link, search and add
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

  // Extract creator from profiles
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

        {/* Games Section -> client component with add functionality */}
        <PollGamesSection pollId={id} initialGames={pollGames} />

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
