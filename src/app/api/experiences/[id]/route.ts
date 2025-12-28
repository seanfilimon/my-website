import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

// GET /api/experiences/[id] - Get single experience
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experience = await prisma.experience.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            title: true,
          },
        },
        resource: true,
        skills: true,
        technologies: true,
        highlights: {
          orderBy: { order: "asc" },
        },
        metrics: {
          orderBy: { order: "asc" },
        },
        tags: true,
        testimonials: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error fetching experience:", error);
    return NextResponse.json(
      { error: "Failed to fetch experience" },
      { status: 500 }
    );
  }
}

// PUT /api/experiences/[id] - Update experience
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user owns the experience or is admin
    const existingExperience = await prisma.experience.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    if (existingExperience.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Extract related data
    const { 
      skills = [], 
      technologies = [], 
      highlights = [], 
      metrics = [],
      tags = [],
      ...experienceData 
    } = body;

    // Update experience
    const experience = await prisma.experience.update({
      where: { id: params.id },
      data: {
        ...experienceData,
        
        // Update skills (disconnect all and reconnect)
        skills: {
          set: [], // Disconnect all
          connectOrCreate: skills.map((skill: any) => ({
            where: { name: skill.name },
            create: skill,
          })),
        },
        
        // Update technologies
        technologies: {
          set: [], // Disconnect all
          connectOrCreate: technologies.map((tech: any) => ({
            where: { name: tech.name },
            create: tech,
          })),
        },
        
        // Update highlights (delete and recreate)
        highlights: {
          deleteMany: {},
          create: highlights.map((highlight: any, index: number) => ({
            content: highlight.content,
            order: highlight.order || index,
          })),
        },
        
        // Update metrics (delete and recreate)
        metrics: {
          deleteMany: {},
          create: metrics.map((metric: any, index: number) => ({
            label: metric.label,
            value: metric.value,
            unit: metric.unit,
            icon: metric.icon,
            order: metric.order || index,
          })),
        },
        
        // Update tags
        tags: {
          set: [], // Disconnect all
          connectOrCreate: tags.map((tag: any) => ({
            where: { name: tag.name || tag },
            create: {
              name: tag.name || tag,
              slug: (tag.name || tag).toLowerCase().replace(/\s+/g, "-"),
            },
          })),
        },
      },
      include: {
        user: true,
        resource: true,
        skills: true,
        technologies: true,
        highlights: true,
        metrics: true,
        tags: true,
      },
    });

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

// DELETE /api/experiences/[id] - Delete experience
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user owns the experience or is admin
    const existingExperience = await prisma.experience.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!existingExperience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    if (existingExperience.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete experience (cascades to highlights and metrics)
    await prisma.experience.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { error: "Failed to delete experience" },
      { status: 500 }
    );
  }
}
