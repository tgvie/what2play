import { NextRequest, NextResponse } from "next/server";
import { searchGames } from "@/utils/igdb/client";

// GET /api/games/search?q=query - Search games via IGDB
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    // Validate query parameter
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search games via IGDB
    const games = await searchGames(query.trim(), 20);

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Game search error:", error);
    return NextResponse.json(
      { error: "Failed to search games" },
      { status: 500 }
    );
  }
}
