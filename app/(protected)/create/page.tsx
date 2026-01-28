"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Create Poll page
*/

export default function CreatePollPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create poll");
        return;
      }

      // Success -> redirect to the new poll page
      router.push(`/poll/${data.poll.id}`);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Create poll error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <main className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Create Poll
          </h1>
          <p className="mt-2 text-zinc-400">
            Start a new game poll and share it with your friends
          </p>
        </div>

        {/* Poll Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm"
        >
          {/* Title input */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Poll Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What should we play this weekend?"
              maxLength={100}
              required
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
              {title.length}/100 characters
            </p>
          </div>

          {/* Description input */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Description <span className="text-zinc-400">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some context for your friends..."
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-50 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            />
            <p className="mt-1 text-xs text-zinc-500">
              {description.length}/500 characters
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full rounded-md bg-zinc-50 px-4 py-3 font-medium text-zinc-900 transition-colors hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Poll"}
          </button>
        </form>

        {/* Back link */}
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
