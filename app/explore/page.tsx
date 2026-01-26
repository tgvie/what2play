import Link from "next/link";
import GameExplorer from "@/components/GameExplorer";

// Explore Games page
export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Explore Games
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Search and discover games from the IGDB database
          </p>
        </div>

        {/* Game Explorer */}
        <GameExplorer placeholder="Search for any game..." />

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
