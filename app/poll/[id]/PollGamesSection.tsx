"use client";

import { useState, useEffect } from "react";
import AddGameSection from "./AddGameSection";

type PollGame = {
  id: string;
  igdb_id: number;
  title: string;
  cover_url: string | null;
  created_at: string;
};

type PollGamesSectionProps = {
  pollId: string;
  initialGames: PollGame[];
};

// Client component for games list with add functionality
export default function PollGamesSection({ pollId, initialGames }: PollGamesSectionProps) {
  const [games, setGames] = useState<PollGame[]>(initialGames);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh games from server
  async function refreshGames() {
    try {
      const response = await fetch(`/api/polls/${pollId}`);
      const data = await response.json();
      if (response.ok && data.games) {
        setGames(data.games);
      }
    } catch (err) {
      console.error("Failed to refresh games:", err);
    }
  }

  // Trigger refresh when a game is added
  function handleGameAdded() {
    setRefreshKey((prev) => prev + 1);
  }

  // Refresh games when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      refreshGames();
    }
  }, [refreshKey]);

  return (
    <div className="mb-6">
      {/* Add Game Section */}
      <AddGameSection pollId={pollId} onGameAdded={handleGameAdded} />

      {/* Games List Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Game Suggestions ({games.length})
        </h2>
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
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

// Game card component
function GameCard({ game }: { game: PollGame }) {
  return (
    <div className="flex gap-3 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {game.cover_url ? (
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

      <div className="flex flex-col justify-center">
        <h3 className="font-medium text-zinc-900 dark:text-zinc-50">
          {game.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          (Voting coming soon)
        </p>
      </div>
    </div>
  );
}
