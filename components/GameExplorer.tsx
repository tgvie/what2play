"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

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
  addingGameId?: number | null;
};

// Reusable game search/explorer component with debounced input
export default function GameExplorer({
  onGameSelect,
  placeholder = "Search for a game...",
  showAddButton = false,
  addButtonLabel = "Add",
  resetKey = 0,
  addingGameId = null,
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

  // Clear search input
  const handleClear = () => {
    setQuery("");
    setGames([]);
    setHasSearched(false);
  };

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-10 text-primary placeholder-muted focus:border-pink/50 focus:outline-none focus:ring-2 focus:ring-pink/20"
          aria-label="Search games"
        />
        {/* Loading spinner/clear button */}
        {loading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-muted" />
          </div>
        ) : query.length > 0 ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-primary"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
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
              isAdding={addingGameId === game.igdb_id}
            />
          ))}
        </div>
      )}

      {/* No results message */}
      {hasSearched && games.length === 0 && !loading && !error && (
        <p className="mt-4 text-center text-muted">
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
  isAdding,
}: {
  game: Game;
  onSelect?: (game: Game) => void;
  showAddButton: boolean;
  addButtonLabel: string;
  isAdding: boolean;
}) {
  return (
    <div className="flex gap-4 border-b border-white/5 py-4 last:border-b-0">
      {/* Game cover */}
      {game.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={game.cover_url}
          alt={`${game.title} cover`}
          className="h-24 w-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-white/5">
          <span className="text-xs text-muted">No img</span>
        </div>
      )}

      {/* Game info */}
      <div className="flex flex-1 flex-col justify-center">
        <h3 className="font-medium text-primary">
          {game.title}
          {game.release_year && (
            <span className="ml-2 text-sm font-normal text-muted">
              ({game.release_year})
            </span>
          )}
        </h3>
        {game.summary && (
          <p className="mt-1 line-clamp-2 text-sm text-secondary">
            {game.summary}
          </p>
        )}
      </div>

      {/* Add button */}
      {showAddButton && onSelect && (
        <div className="flex items-center">
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          ) : (
            <button
              type="button"
              onClick={() => onSelect(game)}
              className="flex shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            >
              {addButtonLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
