"use client";

import { useState } from "react";
import GameExplorer, { Game } from "@/components/GameExplorer";

type AddGameSectionProps = {
  pollId: string;
  onGameAdded: () => void;
};

// Section for searching and adding games
export default function AddGameSection({ pollId, onGameAdded }: AddGameSectionProps) {
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetKey, setResetKey] = useState(0);

  // Handle adding a game to the poll
  async function handleAddGame(game: Game) {
    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/polls/${pollId}/games`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          igdb_id: game.igdb_id,
          title: game.title,
          cover_url: game.cover_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add game");
        return;
      }

      setSuccess(`"${game.title}" added to poll!`);
      onGameAdded();
      setResetKey((prev) => prev + 1);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Add game error:", err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-50">
        Search for a game to add
      </h3>

      {/* Success message */}
      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Game search with add button */}
      <GameExplorer
        placeholder="Search for a game..."
        showAddButton={true}
        addButtonLabel={adding ? "Adding..." : "Add"}
        onGameSelect={handleAddGame}
        resetKey={resetKey}
      />
    </div>
  );
}
