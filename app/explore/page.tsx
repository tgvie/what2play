"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import GameExplorer, { Game } from "@/components/GameExplorer";

// Explore Games page
export default function ExplorePage() {
  const [randomGames, setRandomGames] = useState<Game[]>([]);
  const [loadingRandom, setLoadingRandom] = useState(true);

  // Fetch 10 random games on page load
  useEffect(() => {
    async function fetchRandomGames() {
      try {
        const response = await fetch("/api/games/random");
        const data = await response.json();
        if (response.ok) {
          setRandomGames(data.games || []);
        }
      } catch (err) {
        console.error("Failed to fetch random games:", err);
      } finally {
        setLoadingRandom(false);
      }
    }
    fetchRandomGames();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8">
      <main className="mx-auto w-full max-w-4xl">
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

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Explore Games
          </h1>
          <p className="mt-2 text-zinc-400">
            Search and discover games from the IGDB database
          </p>
        </div>

        {/* Game Explorer (search) */}
        <GameExplorer placeholder="Search for any game..." />

        {/* Random Games Section */}
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Discover Games
            </h2>
            <p className="text-sm text-zinc-500">
              Refresh (F5) this page to see different game suggestions
            </p>
          </div>

          {loadingRandom ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
            </div>
          ) : randomGames.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
              {randomGames.map((game) => (
                <RandomGameCard key={game.igdb_id} game={game} />
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500">No games to display</p>
          )}
        </div>

      </main>
    </div>
  );
}

// Game card for random games grid
function RandomGameCard({ game }: { game: Game }) {
  return (
    <div className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm transition-shadow hover:shadow-md">
      {game.cover_url ? (
        <img
          src={game.cover_url}
          alt={`${game.title} cover`}
          className="aspect-3/4 w-full object-cover"
        />
      ) : (
        <div className="flex aspect-3/4 w-full items-center justify-center bg-zinc-700">
          <span className="text-xs text-zinc-400">No img</span>
        </div>
      )}
      <div className="p-3">
        <h3 className="text-sm font-medium leading-tight">
          {game.title}
        </h3>
        {game.release_year && (
          <p className="mt-1 text-xs text-zinc-500">{game.release_year}</p>
        )}
      </div>
    </div>
  );
}
