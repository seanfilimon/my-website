import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

// GET /api/experiences - Get all experiences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const featured = searchParams.get("featured");
    const published = searchParams.get("published");
    const userId = searchParams.get("userId");
    const resourceId = searchParams.get("resourceId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const orderBy = searchParams.get("orderBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Build where clause
    const where: any = {};
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (featured !== null) where.featured = featured === "true";
    if (published !== null) where.published = published === "true";
    if (userId) where.userId = userId;
    if (resourceId) where.resourceId = resourceId;

    // Fetch experiences
    const experiences = await prisma.experience.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        resource: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
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
          where: { featured: true },
          take: 3,
        },
      },
      orderBy: { [orderBy]: order },
      take: limit,
      skip: offset,
    });

    // Get total count
    const total = await prisma.experience.count({ where });

    return NextResponse.json({
      experiences,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
      { status: 500 }
    );
  }
}

// POST /api/experiences - Create new experience
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { title, type, startDate, description } = body;
    
    if (!title || !type || !startDate || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if slug exists
    const existingSlug = await prisma.experience.findUnique({
      where: { slug },
    });

    const finalSlug = existingSlug 
      ? `${slug}-${Date.now()}`
      : slug;

    // Extract related data
    const { 
      skills = [], 
      technologies = [], 
      highlights = [], 
      metrics = [],
      tags = [],
      ...experienceData 
    } = body;

    // Create experience with relations
    const experience = await prisma.experience.create({
      data: {
        ...experienceData,
        slug: finalSlug,
        userId: session.user.id,
        
        // Connect or create skills
        skills: {
          connectOrCreate: skills.map((skill: any) => ({
            where: { name: skill.name },
            create: skill,
          })),
        },
        
        // Connect or create technologies
        technologies: {
          connectOrCreate: technologies.map((tech: any) => ({
            where: { name: tech.name },
            create: tech,
          })),
        },
        
        // Create highlights
        highlights: {
          create: highlights.map((highlight: any, index: number) => ({
            content: highlight.content,
            order: highlight.order || index,
          })),
        },
        
        // Create metrics
        metrics: {
          create: metrics.map((metric: any, index: number) => ({
            label: metric.label,
            value: metric.value,
            unit: metric.unit,
            icon: metric.icon,
            order: metric.order || index,
          })),
        },
        
        // Connect or create tags
        tags: {
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

    return NextResponse.json(experience, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}
