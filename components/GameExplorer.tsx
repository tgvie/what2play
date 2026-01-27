"use client";

import { useState, useEffect } from "react";

// Game type matching IGDB response
export type Game = {
  igdb_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  summary: string | null;
};

type GameExplorerProps = {
  onGameSelect?: (game: Game) => void;
  placeholder?: string;
  showAddButton?: boolean;
  addButtonLabel?: string;
  resetKey?: number;
};

// Reusable game search/explorer component with debounced input
export default function GameExplorer({
  onGameSelect,
  placeholder = "Search for a game...",
  showAddButton = false,
  addButtonLabel = "Add",
  resetKey = 0,
}: GameExplorerProps) {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Reset search when resetKey changes
  useEffect(() => {
    if (resetKey > 0) {
      setQuery("");
      setGames([]);
      setHasSearched(false);
      setError("");
    }
  }, [resetKey]);

  // Delay search effect
  useEffect(() => {
    // Clear results if query is empty
    if (query.trim().length === 0) {
      setGames([]);
      setHasSearched(false);
      return;
    }

    // Delay the search by 0.5 sec to avoid too many requests while user is typing
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/games/search?q=${encodeURIComponent(query.trim())}`
        );
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Search failed");
          setGames([]);
        } else {
          setGames(data.games || []);
          setHasSearched(true);
        }
      } catch (err) {
        setError("Network error. Please try again.");
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 500); // 0.5 sec search delay

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 pr-10 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
          aria-label="Search games"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}

      {/* Search results */}
      {games.length > 0 && (
        <div className="mt-4 space-y-3">
          {games.map((game) => (
            <GameCard
              key={game.igdb_id}
              game={game}
              onSelect={onGameSelect}
              showAddButton={showAddButton}
              addButtonLabel={addButtonLabel}
            />
          ))}
        </div>
      )}

      {/* No results message */}
      {hasSearched && games.length === 0 && !loading && !error && (
        <p className="mt-4 text-center text-zinc-500">
          No games found for &quot;{query}&quot;
        </p>
      )}
    </div>
  );
}

// Individual game card component
function GameCard({
  game,
  onSelect,
  showAddButton,
  addButtonLabel,
}: {
  game: Game;
  onSelect?: (game: Game) => void;
  showAddButton: boolean;
  addButtonLabel: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-sm">
      {/* Game cover */}
      {game.cover_url ? (
        <img
          src={game.cover_url}
          alt={`${game.title} cover`}
          className="h-24 w-16 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded bg-zinc-700">
          <span className="text-xs text-zinc-400">No img</span>
        </div>
      )}

      {/* Game info */}
      <div className="flex flex-1 flex-col justify-center">
        <h3 className="font-medium text-zinc-50">
          {game.title}
          {game.release_year && (
            <span className="ml-2 text-sm font-normal text-zinc-500">
              ({game.release_year})
            </span>
          )}
        </h3>
        {game.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
            {game.summary}
          </p>
        )}
      </div>

      {/* Add button (optional) */}
      {showAddButton && onSelect && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => onSelect(game)}
            className="shrink-0 rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            {addButtonLabel}
          </button>
        </div>
      )}
    </div>
  );
}
