import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/utils/supabase/server";

/**
 * POST /api/auth/signup
 * Registers a new user with email, password, and username.
 * Creates the user in Supabase Auth and adds a profile entry.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Email, password, and username are required" },
        { status: 400 }
      );
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: "Username must be between 3 and 20 characters" },
        { status: 400 }
      );
    }

    const supabase = createAnonClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store username in user metadata for easy access
        data: { username },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // If signup successful, return session tokens via cookies
    if (authData.session) {
      const response = NextResponse.json(
        {
          message: "Signup successful",
          user: {
            id: authData.user?.id,
            email: authData.user?.email,
            username: username,
          },
        },
        { status: 201 }
      );

      // Set auth cookies (httpOnly for security)
      response.cookies.set("access_token", authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      response.cookies.set("refresh_token", authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    // If no session (email confirmation required), let user know
    return NextResponse.json(
      { message: "Please check your email to confirm your account" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
