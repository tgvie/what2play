import { NextRequest, NextResponse } from "next/server";
import { createAnonClient } from "@/utils/supabase/server";

/**
 * POST /api/auth/login
 * Authenticates user with email and password.
 * Sets session tokens in httpOnly cookies.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createAnonClient();

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Build response with user data
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.user_metadata?.username || null,
        },
      },
      { status: 200 }
    );

    // Set auth cookies (httpOnly for security)
    response.cookies.set("access_token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    });

    response.cookies.set("refresh_token", data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
