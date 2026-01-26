"use client";

import { useState, useCallback } from "react";
import AddGameSection from "./AddGameSection";

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

type PollGamesSectionProps = {
  pollId: string;
  initialGames: PollGame[];
  currentUserId: string | null;
};

// Client component for games list with voting and add game
export default function PollGamesSection({
  pollId,
  initialGames,
  currentUserId,
}: PollGamesSectionProps) {
  const [games, setGames] = useState<PollGame[]>(initialGames);

  // Refresh games from server
  const refreshGames = useCallback(async () => {
    try {
      const response = await fetch(`/api/polls/${pollId}`);
      const data = await response.json();
      if (response.ok && data.games) {
        setGames(data.games);
      }
    } catch (err) {
      console.error("Failed to refresh games:", err);
    }
  }, [pollId]);

  return (
    <div className="mb-6">
      {/* Add Game Section */}
      <AddGameSection pollId={pollId} onGameAdded={refreshGames} />

      {/* Games List Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Game Suggestions ({games.length})
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          Click &quot;Vote&quot; to vote for a game. Click again to remove your vote.
        </p>
      </div>

      {/* Games List */}
      {games.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-500">
            No games suggested yet. Be the first to add one!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              pollId={pollId}
              currentUserId={currentUserId}
              onVoteChange={refreshGames}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Game card component with voting
function GameCard({
  game,
  pollId,
  currentUserId,
  onVoteChange,
}: {
  game: PollGame;
  pollId: string;
  currentUserId: string | null;
  onVoteChange: () => void;
}) {
  const [voting, setVoting] = useState(false);

  // Check if current user has voted
  const hasVoted = currentUserId
    ? game.voters.some((v) => v.id === currentUserId)
    : false;

  // Handle vote toggle
  async function handleVote() {
    if (!currentUserId) return;

    setVoting(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/games/${game.id}/vote`, {
        method: "POST",
      });

      if (response.ok) {
        onVoteChange();
      } else {
        const data = await response.json();
        console.error("Vote error:", data.error);
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Game cover */}
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

      {/* Game info and voting */}
      <div className="flex flex-1 flex-col justify-between">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
          {game.title}
        </h3>

        {/* Voters list */}
        {game.vote_count > 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {game.voters.map((v) => v.username).join(", ")}
          </p>
        )}

        {/* Vote section */}
        <div className="mt-2 flex items-center gap-2">
          {currentUserId ? (
            <button
              type="button"
              onClick={handleVote}
              disabled={voting}
              className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                hasVoted
                  ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {voting ? "..." : hasVoted ? "Voted" : "Vote"}
            </button>
          ) : (
            <span className="text-sm italic text-zinc-400 dark:text-zinc-500">
              Log in to vote
            </span>
          )}
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {game.vote_count} {game.vote_count === 1 ? "vote" : "votes"}
          </span>
        </div>
      </div>
    </div>
  );
}
