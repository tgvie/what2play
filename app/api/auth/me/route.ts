import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/utils/supabase/server";

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's info.
 * Validates the access token from cookies.
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;

    // No tokens = not authenticated
    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated", user: null },
        { status: 401 }
      );
    }

    const supabase = createAnonClient();

    // Try to get user with current access token
    const { data: userData, error: userError } = await supabase.auth.getUser(
      accessToken
    );

    // If access token is valid, return user
    if (userData?.user && !userError) {
      return NextResponse.json({
        user: {
          id: userData.user.id,
          email: userData.user.email,
          username: userData.user.user_metadata?.username || null,
        },
      });
    }

    // If access token expired but we have refresh token, try to refresh
    if (refreshToken) {
      const { data: refreshData, error: refreshError } =
        await supabase.auth.refreshSession({ refresh_token: refreshToken });

      if (refreshData?.session && !refreshError) {
        // Session refreshed - update cookies and return user
        const response = NextResponse.json({
          user: {
            id: refreshData.user?.id,
            email: refreshData.user?.email,
            username: refreshData.user?.user_metadata?.username || null,
          },
        });

        // Update cookies with new tokens
        response.cookies.set(
          "access_token",
          refreshData.session.access_token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60,
            path: "/",
          }
        );

        response.cookies.set(
          "refresh_token",
          refreshData.session.refresh_token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
          }
        );

        return response;
      }
    }

    // All attempts failed - user is not authenticated
    return NextResponse.json(
      { error: "Session expired", user: null },
      { status: 401 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
