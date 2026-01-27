import { NextRequest, NextResponse } from "next/server";
import { createAnonClient, createServerClient } from "@/utils/supabase/server";

// Convert username to internal email format
function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@what2play.local`;
}

// POST /api/auth/signup -> Register new user with username + password
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

    // Validate username format (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if username already exists in profiles table
    const serverClient = createServerClient();
    const { data: existingProfile } = await serverClient
      .from("profiles")
      .select("username")
      .ilike("username", username)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Generate internal email from username
    const email = usernameToEmail(username);
    const supabase = createAnonClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (authError) {
      // Handle duplicate email (username already exists in auth)
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // When user is created, also create a profile entry
    if (authData.user) {
      const { error: profileError } = await serverClient
        .from("profiles")
        .insert({
          id: authData.user.id,
          username: username,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }
    }

    // If signup successful with session, return tokens via cookies
    if (authData.session) {
      const response = NextResponse.json(
        {
          message: "Signup successful",
          user: {
            id: authData.user?.id,
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
        maxAge: 60 * 60,
        path: "/",
      });

      response.cookies.set("refresh_token", authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    // If no session, signup succeeded
    return NextResponse.json(
      {
        message: "Account created successfully",
        user: { username },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
