import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "@/components/LogoutButton";

/**
 * HOME
 */
export default async function Home() {
  // Check if user is logged in (simple cookie check for UI purposes)
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("access_token")?.value;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="w-full max-w-lg text-center">
        {/* Logo/Title */}
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-zinc-50">
          what2play
        </h1>
        <p className="mb-12 text-lg text-zinc-400">
          Create polls, suggest games, and vote with your crew.
        </p>

        {/* Nav Links */}
        <nav className="flex flex-col gap-4" aria-label="Main navigation">
          {/* Create Poll (protected) */}
          <Link
            href="/create"
            className="flex items-center justify-center gap-2 rounded-lg bg-zinc-50 px-6 py-4 text-lg font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            <span aria-hidden="true">+</span> Create Poll
          </Link>

          {/* Poll History (protected) */}
          <Link
            href="/history"
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-4 text-lg font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            <span aria-hidden="true">📋</span> Poll History
          </Link>

          {/* Explore Games (public) */}
          <Link
            href="/explore"
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-4 text-lg font-medium text-zinc-50 transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2"
          >
            <span aria-hidden="true">🎮</span> Explore Games
          </Link>
        </nav>

        {/* Sign in/Sign up */}
        <div className="mt-8 border-t border-zinc-800 pt-8">
          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link
              href="/login"
              className="text-zinc-400 underline underline-offset-4 hover:text-zinc-50"
            >
              Sign in to your account
            </Link>
          )}
        </div>

        {/* Users with poll link */}
        <p className="mt-8 text-sm text-zinc-500">
          Have a poll link? Just paste it in your browser to join!
        </p>
      </main>
    </div>
  );
}

