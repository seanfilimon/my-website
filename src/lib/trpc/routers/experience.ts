import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  editorProcedure,
  adminProcedure,
} from "../init";
import { db } from "@/src/lib/db";

// Input validation schemas
const experienceCreateSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().optional(),
  description: z.string().min(1),
  summary: z.string().optional(),
  type: z.enum([
    "WORK",
    "PROJECT",
    "EDUCATION",
    "CERTIFICATION",
    "VOLUNTEER",
    "ACHIEVEMENT",
    "SPEAKING",
    "PUBLICATION",
  ]),
  employmentType: z
    .enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACT",
      "FREELANCE",
      "INTERNSHIP",
      "REMOTE",
      "HYBRID",
    ])
    .optional(),
  status: z
    .enum(["CURRENT", "COMPLETED", "UPCOMING", "ON_HOLD"])
    .default("COMPLETED"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  duration: z.string().optional(),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  organization: z.string().optional(),
  organizationLogo: z.string().optional(),
  organizationUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  projectUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  demoUrl: z.string().optional(),
  videoUrl: z.string().optional(),
  resourceId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  slug: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
  skills: z
    .array(
      z.object({
        name: z.string(),
        level: z.string().optional(),
        yearsOfUse: z.number().int().optional(),
      }),
    )
    .optional(),
  technologies: z
    .array(
      z.object({
        name: z.string(),
        category: z.string().optional(),
        icon: z.string().optional(),
      }),
    )
    .optional(),
  highlights: z
    .array(
      z.object({
        content: z.string(),
        order: z.number().int().optional(),
      }),
    )
    .optional(),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        unit: z.string().optional(),
        icon: z.string().optional(),
        order: z.number().int().optional(),
      }),
    )
    .optional(),
  tags: z.array(z.string()).optional(),
});

const experienceUpdateSchema = experienceCreateSchema.partial().extend({
  id: z.string(),
});

const experienceListSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
  type: z
    .enum([
      "WORK",
      "PROJECT",
      "EDUCATION",
      "CERTIFICATION",
      "VOLUNTEER",
      "ACHIEVEMENT",
      "SPEAKING",
      "PUBLICATION",
    ])
    .optional(),
  status: z.enum(["CURRENT", "COMPLETED", "UPCOMING", "ON_HOLD"]).optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
  userId: z.string().optional(),
  resourceId: z.string().optional(),
  search: z.string().optional(),
  orderBy: z
    .enum(["createdAt", "updatedAt", "startDate", "endDate", "order"])
    .default("startDate"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const experienceRouter = createTRPCRouter({
  // List experiences with pagination and filters
  list: publicProcedure
    .input(experienceListSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, order, search, ...filters } = input;

      const where: any = {};

      if (filters.type) where.type = filters.type;
      if (filters.status) where.status = filters.status;
      if (filters.featured !== undefined) where.featured = filters.featured;
      if (filters.published !== undefined) where.published = filters.published;
      if (filters.userId) where.userId = filters.userId;
      if (filters.resourceId) where.resourceId = filters.resourceId;

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { subtitle: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { organization: { contains: search, mode: "insensitive" } },
        ];
      }

      const experiences = await db.experience.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [orderBy]: order },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
          resource: {
            select: { id: true, name: true, slug: true, icon: true },
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
      });

      let nextCursor: string | undefined;
      if (experiences.length > limit) {
        const nextItem = experiences.pop();
        nextCursor = nextItem?.id;
      }

      return {
        experiences,
        nextCursor,
      };
    }),

  // Get single experience by ID
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const experience = await db.experience.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
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
          testimonials: true,
        },
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      return experience;
    }),

  // Get single experience by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const experience = await db.experience.findUnique({
        where: { slug: input.slug },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              bio: true,
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
          testimonials: true,
        },
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      return experience;
    }),

  // Create experience
  create: editorProcedure
    .input(experienceCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure user exists in local DB
      const userExists = await db.user.findUnique({
        where: { id: ctx.userId },
      });

      if (!userExists && ctx.userEmail) {
        await db.user.create({
          data: {
            id: ctx.userId,
            email: ctx.userEmail,
            name: ctx.userName,
            role: "ADMIN",
          },
        });
      }

      const {
        skills,
        technologies,
        highlights,
        metrics,
        tags,
        gallery,
        ...data
      } = input;

      // Generate slug if not provided
      const slug =
        data.slug ||
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      // Check for existing slug
      const existing = await db.experience.findUnique({
        where: { slug },
      });

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const experience = await db.experience.create({
        data: {
          ...data,
          slug: finalSlug,
          gallery: gallery || [],
          userId: ctx.userId,
          skills: skills?.length
            ? {
                connectOrCreate: skills.map((skill) => ({
                  where: { name: skill.name },
                  create: skill,
                })),
              }
            : undefined,
          technologies: technologies?.length
            ? {
                connectOrCreate: technologies.map((tech) => ({
                  where: { name: tech.name },
                  create: tech,
                })),
              }
            : undefined,
          highlights: highlights?.length
            ? {
                create: highlights.map((h, index) => ({
                  content: h.content,
                  order: h.order ?? index,
                })),
              }
            : undefined,
          metrics: metrics?.length
            ? {
                create: metrics.map((m, index) => ({
                  label: m.label,
                  value: m.value,
                  unit: m.unit,
                  icon: m.icon,
                  order: m.order ?? index,
                })),
              }
            : undefined,
          tags: tags?.length
            ? {
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: {
                    name: tag,
                    slug: tag.toLowerCase().replace(/\s+/g, "-"),
                  },
                })),
              }
            : undefined,
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

      return experience;
    }),

  // Update experience
  update: editorProcedure
    .input(experienceUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        skills,
        technologies,
        highlights,
        metrics,
        tags,
        gallery,
        ...data
      } = input;

      const existing = await db.experience.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const userRole = ctx.role;
      if (existing.userId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own experiences",
        });
      }

      // Delete existing highlights and metrics to replace them
      if (highlights !== undefined) {
        await db.experienceHighlight.deleteMany({
          where: { experienceId: id },
        });
      }
      if (metrics !== undefined) {
        await db.experienceMetric.deleteMany({
          where: { experienceId: id },
        });
      }

      const experience = await db.experience.update({
        where: { id },
        data: {
          ...data,
          gallery: gallery || undefined,
          skills: skills?.length
            ? {
                set: [],
                connectOrCreate: skills.map((skill) => ({
                  where: { name: skill.name },
                  create: skill,
                })),
              }
            : undefined,
          technologies: technologies?.length
            ? {
                set: [],
                connectOrCreate: technologies.map((tech) => ({
                  where: { name: tech.name },
                  create: tech,
                })),
              }
            : undefined,
          highlights: highlights?.length
            ? {
                create: highlights.map((h, index) => ({
                  content: h.content,
                  order: h.order ?? index,
                })),
              }
            : undefined,
          metrics: metrics?.length
            ? {
                create: metrics.map((m, index) => ({
                  label: m.label,
                  value: m.value,
                  unit: m.unit,
                  icon: m.icon,
                  order: m.order ?? index,
                })),
              }
            : undefined,
          tags: tags?.length
            ? {
                set: [],
                connectOrCreate: tags.map((tag) => ({
                  where: { name: tag },
                  create: {
                    name: tag,
                    slug: tag.toLowerCase().replace(/\s+/g, "-"),
                  },
                })),
              }
            : undefined,
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

      return experience;
    }),

  // Delete experience
  delete: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.experience.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const userRole = ctx.role;
      if (existing.userId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own experiences",
        });
      }

      await db.experience.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Toggle featured
  toggleFeatured: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const experience = await db.experience.findUnique({
        where: { id: input.id },
        select: { featured: true },
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const updated = await db.experience.update({
        where: { id: input.id },
        data: { featured: !experience.featured },
        select: { featured: true },
      });

      return { featured: updated.featured };
    }),

  // Toggle published
  togglePublished: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const experience = await db.experience.findUnique({
        where: { id: input.id },
        select: { published: true, userId: true },
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const userRole = ctx.role;
      if (experience.userId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own experiences",
        });
      }

      const updated = await db.experience.update({
        where: { id: input.id },
        data: { published: !experience.published },
        select: { published: true },
      });

      return { published: updated.published };
    }),

  // Reorder experiences
  reorder: editorProcedure
    .input(
      z.object({
        experienceIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.experienceIds.map((id, index) =>
          db.experience.update({
            where: { id },
            data: { order: index },
          }),
        ),
      );

      return { success: true };
    }),

  // Get skills
  getSkills: publicProcedure.query(async ({ ctx }) => {
    return db.experienceSkill.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Get technologies
  getTechnologies: publicProcedure.query(async ({ ctx }) => {
    return db.experienceTechnology.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // Get tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    return db.experienceTag.findMany({
      orderBy: { name: "asc" },
    });
  }),

  // ==================== TESTIMONIALS ====================

  // Add testimonial
  addTestimonial: protectedProcedure
    .input(
      z.object({
        experienceId: z.string(),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        authorName: z.string().min(1),
        authorTitle: z.string().optional(),
        authorCompany: z.string().optional(),
        authorImage: z.string().optional(),
        authorLinkedIn: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const testimonial = await db.testimonial.create({
        data: input,
      });

      return testimonial;
    }),

  // Update testimonial
  updateTestimonial: editorProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        authorName: z.string().optional(),
        authorTitle: z.string().optional(),
        authorCompany: z.string().optional(),
        authorImage: z.string().optional(),
        authorLinkedIn: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        verified: z.boolean().optional(),
        featured: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const testimonial = await db.testimonial.update({
        where: { id },
        data,
      });

      return testimonial;
    }),

  // Delete testimonial
  deleteTestimonial: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.testimonial.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
