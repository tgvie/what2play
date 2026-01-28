"use client";

import { useState } from "react";
import GameExplorer, { Game } from "@/components/GameExplorer";

type AddGameSectionProps = {
  pollId: string;
  onGameAdded: (igdbId: number) => void;
};

// Section for searching and adding games
export default function AddGameSection({ pollId, onGameAdded }: AddGameSectionProps) {
  const [addingGameId, setAddingGameId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  // Handle adding a game to the poll
  async function handleAddGame(game: Game) {
    setAddingGameId(game.igdb_id);
    setError("");

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

      // Notify parent with the added game's igdb_id for highlighting
      onGameAdded(game.igdb_id);
      setResetKey((prev) => prev + 1);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Add game error:", err);
    } finally {
      setAddingGameId(null);
    }
  }

  return (
    <div
      className="mb-6 rounded-xl border border-white/10 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px]"
      style={{ background: "rgba(255, 255, 255, 0.03)" }}
    >
      {/* Header */}
      <h3 className="mb-4 font-semibold text-primary">
        Search for a game to add
      </h3>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Game search with add button */}
      <GameExplorer
        placeholder="Search for a game..."
        showAddButton={true}
        addButtonLabel="Add"
        onGameSelect={handleAddGame}
        resetKey={resetKey}
        addingGameId={addingGameId}
      />
    </div>
  );
}
