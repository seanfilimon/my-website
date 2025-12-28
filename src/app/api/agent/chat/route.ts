/**
 * Agent Chat API Route
 * Handles message sending and triggers Inngest function
 * Works with @inngest/use-agent hook
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/lib/db";
import { inngest } from "@/src/lib/inngest/client";
import type { UnifiedContentRequest } from "@/src/lib/inngest/events/content";

interface ChatRequest {
  threadId: string;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * POST - Send message and trigger content generation
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ChatRequest = await request.json();
    const { threadId, message, context } = body;

    if (!threadId || !message) {
      return NextResponse.json(
        { error: "threadId and message are required" },
        { status: 400 }
      );
    }

    // Ensure thread exists or create it
    let thread = await db.agentThread.findFirst({
      where: { id: threadId, userId },
    });

    if (!thread) {
      thread = await db.agentThread.create({
        data: {
          id: threadId,
          userId,
          title: message.slice(0, 100),
          metadata: context,
        },
      });
    }

    // Save user message
    const userMessage = await db.agentMessage.create({
      data: {
        threadId,
        role: "user",
        content: message,
        metadata: { context },
      },
    });

    // Update thread timestamp
    await db.agentThread.update({
      where: { id: threadId },
      data: { updatedAt: new Date() },
    });

    // Build content request
    const contentRequest: UnifiedContentRequest = {
      userId,
      threadId,
      message,
      context: context as UnifiedContentRequest["context"],
    };

    // Trigger Inngest function
    const sendResult = await inngest.send({
      name: "content/request",
      data: contentRequest,
    });

    const eventId = sendResult.ids?.[0] || `event-${Date.now()}`;

    // Create initial assistant message (will be updated by the function)
    const assistantMessage = await db.agentMessage.create({
      data: {
        threadId,
        role: "assistant",
        content: "Processing your request...",
        metadata: {
          eventId,
          status: "processing",
        },
      },
    });

    return NextResponse.json({
      success: true,
      threadId,
      eventId,
      userMessageId: userMessage.id,
      assistantMessageId: assistantMessage.id,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
