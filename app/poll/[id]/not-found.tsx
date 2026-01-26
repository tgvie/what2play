import Link from "next/link";

// 404 page for when a poll is not found
export default function PollNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-lg text-center">
        <h1 className="mb-4 text-6xl font-bold text-zinc-300 dark:text-zinc-700">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Poll Not Found
        </h2>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          This poll doesn&apos;t exist or may have been deleted.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/create"
            className="rounded-md bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Create a Poll
          </Link>
          <Link
            href="/"
            className="rounded-md border border-zinc-300 bg-white px-6 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Go Home
          </Link>
        </div>
      </main>
    </div>
  );
}
