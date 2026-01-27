"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CreatedPoll = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  game_count: number;
};

type ParticipatedPoll = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  creator_username: string;
};

// Poll History page
export default function HistoryPage() {
  const [createdPolls, setCreatedPolls] = useState<CreatedPoll[]>([]);
  const [participatedPolls, setParticipatedPolls] = useState<ParticipatedPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch poll history on mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch("/api/polls/history");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to load history");
          return;
        }

        setCreatedPolls(data.created || []);
        setParticipatedPolls(data.participated || []);
      } catch (err) {
        setError("Network error. Please try again.");
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  // Format date for display
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <main className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-50">Poll History</h1>
          <p className="mt-2 text-zinc-400">
            Your created polls and polls you&apos;ve participated in
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mb-6 rounded-md border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Created Polls section */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-zinc-50">
                Polls You Created ({createdPolls.length})
              </h2>

              {createdPolls.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center">
                  <p className="text-zinc-500">You haven&apos;t created any polls yet.</p>
                  <Link
                    href="/create"
                    className="mt-3 inline-block text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-50"
                  >
                    Create your first poll
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {createdPolls.map((poll) => (
                    <Link
                      key={poll.id}
                      href={`/poll/${poll.id}`}
                      className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
                    >
                      <h3 className="font-medium text-zinc-50">{poll.title}</h3>
                      {poll.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                          {poll.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-zinc-500">
                        {poll.game_count} {poll.game_count === 1 ? "game" : "games"} •{" "}
                        {formatDate(poll.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Participated Polls section */}
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold text-zinc-50">
                Other Polls You Voted In ({participatedPolls.length})
              </h2>

              {participatedPolls.length === 0 ? (
                <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center">
                  <p className="text-zinc-500">You haven&apos;t voted in anyone else&apos;s polls yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {participatedPolls.map((poll) => (
                    <Link
                      key={poll.id}
                      href={`/poll/${poll.id}`}
                      className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-800"
                    >
                      <h3 className="font-medium text-zinc-50">{poll.title}</h3>
                      {poll.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                          {poll.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-zinc-500">
                        by {poll.creator_username} • {formatDate(poll.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
