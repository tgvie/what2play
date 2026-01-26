import { NextRequest, NextResponse } from "next/server";
import { createServerClient, createAnonClient } from "@/utils/supabase/server";

// POST /api/polls - Create a new poll
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value;

    // Must be authenticated to create a poll
    if (!accessToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user's token and get their ID
    const anonClient = createAnonClient();
    const { data: userData, error: userError } = await anonClient.auth.getUser(
      accessToken
    );

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // Parse request body
    const { title, description } = await request.json();

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Poll title is required" },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Validate description length if any
    if (description && description.length > 500) {
      return NextResponse.json(
        { error: "Description must be 500 characters or less" },
        { status: 400 }
      );
    }

    // Insert poll into database using service role client
    const supabase = createServerClient();
    const { data: poll, error: insertError } = await supabase
      .from("polls")
      .insert({
        creator_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Poll creation error:", insertError);
      return NextResponse.json(
        { error: "Failed to create poll" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Poll created successfully",
        poll: {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          created_at: poll.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create poll error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
