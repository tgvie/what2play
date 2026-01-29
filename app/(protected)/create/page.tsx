"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import Button from "@/components/Button";

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
          <Logo />
          <h1 className="mt-4 text-3xl font-semibold text-primary">
            Create a new poll
          </h1>
        </div>

        {/* Poll Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-white/10 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px]"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        >
          {/* Title input */}
          <div className="mb-4">
            <label
              htmlFor="title"
              className="mb-2 block text-base font-medium text-secondary"
            >
              Poll Title <span className="text-pink">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Friday Game Night, Co-op Games..."
              maxLength={100}
              required
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-primary placeholder-muted transition-colors focus:border-pink/50 focus:outline-none focus:ring-2 focus:ring-pink/20"
            />
            <p className="mt-1 text-xs text-muted">
              {title.length}/100 characters
            </p>
          </div>

          {/* Description input */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="mb-2 block text-base font-medium text-secondary"
            >
              Description <span className="text-muted">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add some context for your friends..."
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-primary placeholder-muted transition-colors focus:border-pink/50 focus:outline-none focus:ring-2 focus:ring-pink/20"
            />
            <p className="mt-1 text-xs text-muted">
              {description.length}/500 characters
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Poll"}
          </Button>
        </form>

        {/* Back link */}
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
