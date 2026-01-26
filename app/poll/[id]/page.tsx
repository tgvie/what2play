import Link from "next/link";
import { headers } from "next/headers";
import CopyButton from "./CopyButton";

// Poll View page

export default async function PollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Get the host to build the shareable URL
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const shareableUrl = `${protocol}://${host}/poll/${id}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Poll Created!
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Share this link with your crew to start adding games and voting
          </p>
        </div>

        {/* Shareable Link Card */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Shareable Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareableUrl}
              readOnly
              className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
            <CopyButton url={shareableUrl} />
          </div>

          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
            Poll ID: <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs dark:bg-zinc-800">{id}</code>
          </p>
        </div>

        {/* Placeholder for games list */}
        <div className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-zinc-500 dark:text-zinc-500">
            Game suggestions and voting coming soon...
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/create"
            className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Create another poll
          </Link>
          <Link
            href="/"
            className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
