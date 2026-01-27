import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/utils/supabase/server";

// Convert username to internal email format
function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@what2play.local`;
}

// POST /api/auth/login -> Authenticate with username + password
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validate required inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Convert username to internal email format
    const email = usernameToEmail(username);
    const supabase = createAnonClient();

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Return generic error to avoid revealing if username exists
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Build response with user data
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: data.user.id,
          username: data.user.user_metadata?.username || username,
        },
      },
      { status: 200 }
    );

    // Set auth cookies (httpOnly for security)
    response.cookies.set("access_token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });

    response.cookies.set("refresh_token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
