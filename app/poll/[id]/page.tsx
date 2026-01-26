import Link from "next/link";

/**
 * Poll View page
 * Public route - anyone with the link can view
 * Voting requires authentication
 */
export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-lg text-center">
        <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Poll View
        </h1>
        <p className="mb-4 text-zinc-600 dark:text-zinc-400">
          Viewing poll with ID:
        </p>
        <code className="mb-8 block rounded bg-zinc-200 px-4 py-2 font-mono text-sm dark:bg-zinc-800">
          {id}
        </code>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-500">
          (Poll details coming soon)
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
