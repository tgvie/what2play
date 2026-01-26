import Link from "next/link";

/**
 * Poll History page
 * Protected route - user must be authenticated to access
 * Shows polls created by user + polls they've participated in
 */
export default function HistoryPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-lg text-center">
        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Poll History
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          This page is protected. If you can see this, you are authenticated!
        </p>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-500">
          (Your poll history coming soon)
        </p>
        <Link
          href="/"
          className="text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
