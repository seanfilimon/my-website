/**
 * Agent Threads API Route
 * CRUD operations for conversation threads
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src/lib/db";

/**
 * GET - Fetch paginated threads for user
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");

    const threads = await db.agentThread.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, role: true },
        },
        _count: { select: { messages: true } },
      },
    });

    const hasMore = threads.length > limit;
    const items = hasMore ? threads.slice(0, -1) : threads;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return NextResponse.json({
      threads: items.map((t) => ({
        id: t.id,
        title: t.title || t.messages[0]?.content?.slice(0, 50) || "New conversation",
        lastMessage: t.messages[0]?.content,
        messageCount: t._count.messages,
        metadata: t.metadata,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new thread
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, metadata } = body;

    const thread = await db.agentThread.create({
      data: {
        userId,
        title,
        metadata,
      },
    });

    return NextResponse.json({ thread });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete thread by ID (passed in body)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json(
        { error: "Thread ID required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const thread = await db.agentThread.findFirst({
      where: { id: threadId, userId },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    await db.agentThread.delete({ where: { id: threadId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting thread:", error);
    return NextResponse.json(
      { error: "Failed to delete thread" },
      { status: 500 }
    );
  }
}
