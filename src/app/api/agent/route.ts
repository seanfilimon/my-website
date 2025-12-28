/**
 * Agent Streaming API Route
 * Triggers unified Inngest content generation function
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { inngest } from "@/src/lib/inngest/client";
import type { ContentType, UnifiedContentRequest } from "@/src/lib/inngest/events/content";

/**
 * Request body interface
 */
interface AgentRequest {
  message: string;
  threadId: string;
  contentType?: ContentType;
  context?: {
    topic?: string;
    instructions?: string;
    audience?: string;
    tone?: "professional" | "casual" | "technical" | "educational";
    wordCount?: number;
    resourceId?: string;
    categoryId?: string;
    difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    /** For resource creation */
    resourceName?: string;
    officialUrl?: string;
    docsUrl?: string;
    githubUrl?: string;
  };
  mode?: "full" | "quick";
  autoDetect?: boolean;
}

/**
 * POST handler for agent chat
 * Triggers Inngest functions and streams progress
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
    const body: AgentRequest = await request.json();

    if (!body.message || !body.threadId) {
      return NextResponse.json(
        { error: "Missing required fields: message, threadId" },
        { status: 400 }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial message
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "start",
                threadId: body.threadId,
                message: body.message,
                mode: body.mode || "full",
              })}\n\n`
            )
          );

          // Build the unified content request payload
          const contentRequest: UnifiedContentRequest = {
            userId,
            threadId: body.threadId,
            message: body.message,
            contentTypeHint: body.contentType,
            context: body.context,
          };

          // Send tool call for triggering unified content generation
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "tool_call",
                agent: "Content Orchestrator",
                tool: {
                  name: "triggerContentGeneration",
                  input: { message: body.message, context: body.context },
                  status: "pending",
                },
              })}\n\n`
            )
          );

          // Trigger the unified Inngest function
          const sendResult = await inngest.send({
            name: "content/request",
            data: contentRequest,
          });

          const eventIds = sendResult.ids || [];
          const eventId = eventIds[0] || `event-${Date.now()}`;

          // Send confirmation
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "tool_call",
                agent: "Content Orchestrator",
                tool: {
                  name: "triggerContentGeneration",
                  input: { message: body.message, context: body.context },
                  output: { eventId, status: "triggered" },
                  status: "completed",
                },
              })}\n\n`
            )
          );

          // Send agent status - the unified orchestrator handles everything
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "agent",
                agent: "Content Orchestrator",
                status: "processing",
                message: "Analyzing request and generating content...",
              })}\n\n`
            )
          );

          // Send triggered event info
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "triggered",
                eventId,
                message: body.message,
                info: "The Content Orchestrator will identify what you want to create and generate it automatically.",
              })}\n\n`
            )
          );

          // Send completion
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                threadId: body.threadId,
                success: true,
                eventId,
                message: "Content generation triggered. The AI will analyze your request, research if needed, create the content, and save it as a draft. Check your drafts shortly.",
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error("Agent execution error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: error instanceof Error ? error.message : "Unknown error",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET handler for checking agent status
 */
export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: "ready",
    availableContentTypes: ["blog", "article", "resource"],
    availableModes: ["full", "quick"],
    features: {
      unifiedAgent: true,
      webSearch: !!process.env.TAVILY_API_KEY,
      autoSave: true,
      inngestIntegration: true,
    },
    agents: [
      { 
        name: "Content Orchestrator", 
        description: "Unified AI agent that identifies content type and handles research, writing, editing, SEO, and saving automatically" 
      },
    ],
  });
}
