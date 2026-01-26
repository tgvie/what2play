/** IGDB API client with Twitch OAuth token */ 

// Cache for the access token (in-memory, resets on server restart)
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Get a valid Twitch OAuth token (fetches new one if expired)
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET");
  }

  // Request new token from Twitch
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!response.ok) {
    throw new Error("Failed to get Twitch access token");
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

// Search games on IGDB by query string
export async function searchGames(query: string, limit: number = 20) {
  const token = await getAccessToken();
  const clientId = process.env.TWITCH_CLIENT_ID!;

  // IGDB API query -> search for games
  const body = `search "${query}"; fields id, name, cover.url, first_release_date, summary; limit ${limit};`;

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: body,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("IGDB API error:", error);
    throw new Error("Failed to search games");
  }

  const games = await response.json();

  // Transform response to our format
  return games.map((game: {
    id: number;
    name: string;
    cover?: { url: string };
    first_release_date?: number;
    summary?: string;
  }) => ({
    igdb_id: game.id,
    title: game.name,
    // IGDB returns URLs starting with // need to add https:
    // Convert thumbnail to larger cover image
    cover_url: game.cover?.url
      ? "https:" + game.cover.url.replace("t_thumb", "t_cover_big")
      : null,
    release_year: game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : null,
    summary: game.summary || null,
  }));
}

// Game type returned from search
export type IGDBGame = {
  igdb_id: number;
  title: string;
  cover_url: string | null;
  release_year: number | null;
  summary: string | null;
};
