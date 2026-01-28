"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { UserCheck, Loader2, CheckCheck } from "lucide-react";
import AddGameSection from "./AddGameSection";

type Voter = {
  id: string | null;
  username: string;
};

type PollGame = {
  id: string;
  igdb_id: number;
  title: string;
  cover_url: string | null;
  created_at: string;
  vote_count: number;
  voters: Voter[];
};

type PollGamesSectionProps = {
  pollId: string;
  initialGames: PollGame[];
  currentUserId: string | null;
};

// Client component for games list with voting and add game
export default function PollGamesSection({
  pollId,
  initialGames,
  currentUserId,
}: PollGamesSectionProps) {
  const [games, setGames] = useState<PollGame[]>(initialGames);
  const [highlightedGameId, setHighlightedGameId] = useState<number | null>(null);

  // Refresh games from server
  const refreshGames = useCallback(async () => {
    try {
      const response = await fetch(`/api/polls/${pollId}`);
      const data = await response.json();
      if (response.ok && data.games) {
        setGames(data.games);
      }
    } catch (err) {
      console.error("Failed to refresh games:", err);
    }
  }, [pollId]);

  // Handle game added -> highlight and fade out over 3 seconds
  const handleGameAdded = useCallback(async (igdbId: number) => {
    await refreshGames();
    setHighlightedGameId(igdbId);
    // Start fade out on next frame so animation triggers
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHighlightedGameId(null);
      });
    });
  }, [refreshGames]);

  return (
    <div className="mb-6">
      {/* Add Game Section */}
      <AddGameSection pollId={pollId} onGameAdded={handleGameAdded} />

      {/* Games List Header */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-primary">
          Game Suggestions ({games.length})
        </h2>
        <p className="mt-1 text-sm text-muted">
          Click &quot;Vote&quot; to vote for a game. Click again to remove your vote.
        </p>
      </div>

      {/* Games List - sorted by votes (highest first) */}
      {games.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-white/10 p-8 text-center shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px]"
          style={{ background: "rgba(255, 255, 255, 0.03)" }}
        >
          <p className="text-muted">
            No games suggested yet. Be the first to add one!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...games]
            .sort((a, b) => b.vote_count - a.vote_count)
            .map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                pollId={pollId}
                currentUserId={currentUserId}
                onVoteChange={refreshGames}
                isTopThree={index < 3 && game.vote_count > 0}
                isHighlighted={highlightedGameId === game.igdb_id}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// Game card component with voting
function GameCard({
  game,
  pollId,
  currentUserId,
  onVoteChange,
  isTopThree,
  isHighlighted,
}: {
  game: PollGame;
  pollId: string;
  currentUserId: string | null;
  onVoteChange: () => void;
  isTopThree: boolean;
  isHighlighted: boolean;
}) {
  const [voting, setVoting] = useState(false);

  // Check if current user has voted
  const hasVoted = currentUserId
    ? game.voters.some((v) => v.id === currentUserId)
    : false;

  // Handle vote toggle
  async function handleVote() {
    if (!currentUserId) return;

    setVoting(true);
    try {
      const response = await fetch(`/api/polls/${pollId}/games/${game.id}/vote`, {
        method: "POST",
      });

      if (response.ok) {
        onVoteChange();
      } else {
        const data = await response.json();
        console.error("Vote error:", data.error);
      }
    } catch (err) {
      console.error("Vote error:", err);
    } finally {
      setVoting(false);
    }
  }

  // Determine card styling based on state
  const getCardStyles = () => {
    if (isHighlighted) {
      return "border-green-500/50 bg-green-500/10";
    }
    if (isTopThree) {
      return "border-pink/30 bg-pink/10";
    }
    return "border-white/10";
  };

  return (
    <div
      className={`flex gap-3 rounded-xl border p-3 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[2.2px] transition-all duration-3000 ease-out ${getCardStyles()}`}
      style={!isTopThree && !isHighlighted ? { background: "rgba(255, 255, 255, 0.03)" } : undefined}
    >
      {/* Game cover */}
      {game.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={game.cover_url}
          alt={`${game.title} cover`}
          className="h-20 w-14 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg bg-white/10">
          <span className="text-xs text-muted">No img</span>
        </div>
      )}

      {/* Game info and voting */}
      <div className="flex flex-1 flex-col justify-between">
        <h3 className="font-medium text-primary">
          {game.title}
        </h3>

        {/* Voters list */}
        {game.vote_count > 0 && (
          <p className="flex items-center gap-1 text-xs text-secondary">
            <UserCheck className="h-3.5 w-3.5" />
            {game.voters.map((v) => v.username).join(", ")}
          </p>
        )}

        {/* Vote section */}
        <div className="mt-2 flex items-center gap-2">
          {currentUserId ? (
            <button
              type="button"
              onClick={handleVote}
              disabled={voting}
              className={`cursor-pointer rounded-md border px-3 py-1 text-sm font-medium transition-colors duration-150 ${
                hasVoted
                  ? "border-pink/30 bg-pink/20 text-pink hover:bg-pink/30"
                  : "border-pink/50 bg-pink text-surface hover:bg-pink-light"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {voting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasVoted ? (
                <span className="flex items-center gap-1">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Voted
                </span>
              ) : "Vote"}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-sm text-pink underline underline-offset-2 hover:text-pink-light"
            >
              Log in to vote
            </Link>
          )}
          <span className="text-sm text-muted">
            {game.vote_count} {game.vote_count === 1 ? "vote" : "votes"}
          </span>
        </div>
      </div>
    </div>
  );
}
