import { NextResponse } from "next/server";
import { getRandomGames } from "@/utils/igdb/client";

// GET /api/games/random - Fetch random popular games
export async function GET() {
  try {
    const games = await getRandomGames(10);
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Random games error:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
