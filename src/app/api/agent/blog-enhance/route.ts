/**
 * Blog Enhancement Agent Streaming API Route
 * Provides real-time streaming of blog enhancement progress
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/src/lib/inngest/client";

/**
 * Request body interface
 */
interface BlogEnhanceRequest {
  blogId: string;
  instruction: string;
  urls?: string[];
  threadId?: string;
  autoSave?: boolean;
}

/**
 * POST handler for blog enhancement
 * Triggers Inngest function and returns streaming response
 */
export async function POST(request: NextRequest) {
  try {
    // Check for Google API key
    if (!process.env.GOOGLE_API_KEY) {
      console.error("GOOGLE_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "AI service not configured. Please set GOOGLE_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Authenticate the request
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the request body
    const body: BlogEnhanceRequest = await request.json();

    if (!body.blogId || !body.instruction) {
      return NextResponse.json(
        { error: "Missing required fields: blogId, instruction" },
        { status: 400 }
      );
    }

    // Generate thread ID if not provided
    const threadId = body.threadId || `thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Trigger the Inngest function
    await inngest.send({
      name: "blog/enhance.request",
      data: {
        userId,
        blogId: body.blogId,
        instruction: body.instruction,
        urls: body.urls,
        threadId,
        autoSave: body.autoSave || false,
        content: "", // Will be loaded by the function
      },
    });

    // Return success with thread ID
    return NextResponse.json({
      success: true,
      threadId,
      message: "Enhancement started",
    });

  } catch (error: any) {
    console.error("Blog enhance API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start enhancement" },
      { status: 500 }
    );
  }
}
