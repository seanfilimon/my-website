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
const courseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
  subtitle: z.string().optional(),
  description: z.string().min(1),
  resourceId: z.string(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("INTERMEDIATE"),
  language: z.string().default("English"),
  price: z.number().min(0),
  discountPrice: z.number().min(0).optional(),
  thumbnail: z.string().optional(),
  promoVideo: z.string().optional(),
  duration: z.string().default("0 hours"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

const courseUpdateSchema = courseCreateSchema.partial().extend({
  id: z.string(),
});

const sectionCreateSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  order: z.number().int().min(0),
  duration: z.string().default("0 min"),
});

const sectionUpdateSchema = sectionCreateSchema.partial().extend({
  id: z.string(),
});

const lessonCreateSchema = z.object({
  sectionId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  order: z.number().int().min(0),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().default("0:00"),
  isFree: z.boolean().default(false),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
  })).optional(),
});

const lessonUpdateSchema = lessonCreateSchema.partial().extend({
  id: z.string(),
});

const courseListSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().optional(),
  resourceId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  featured: z.boolean().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  instructorId: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  orderBy: z.enum(["createdAt", "updatedAt", "publishedAt", "rating", "enrollments", "price"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const courseRouter = createTRPCRouter({
  // List courses with pagination and filters
  list: publicProcedure
    .input(courseListSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, order, search, minPrice, maxPrice, ...filters } = input;

      const where: any = {};
      
      if (filters.resourceId) where.resourceId = filters.resourceId;
      if (filters.status) where.status = filters.status;
      if (filters.featured !== undefined) where.featured = filters.featured;
      if (filters.level) where.level = filters.level;
      if (filters.instructorId) where.instructorId = filters.instructorId;
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) where.price.gte = minPrice;
        if (maxPrice !== undefined) where.price.lte = maxPrice;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { subtitle: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const courses = await db.course.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [orderBy]: order },
        include: {
          instructor: {
            select: { id: true, name: true, image: true },
          },
          resource: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
          tags: true,
          _count: {
            select: { sections: true, enrolledUsers: true, reviews: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (courses.length > limit) {
        const nextItem = courses.pop();
        nextCursor = nextItem?.id;
      }

      return {
        courses,
        nextCursor,
      };
    }),

  // Get single course by ID with full details
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await db.course.findUnique({
        where: { id: input.id },
        include: {
          instructor: {
            select: { id: true, name: true, image: true, bio: true },
          },
          resource: true,
          tags: true,
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
          },
          reviews: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  // Get single course by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const course = await db.course.findUnique({
        where: { slug: input.slug },
        include: {
          instructor: {
            select: { id: true, name: true, image: true, bio: true },
          },
          resource: true,
          tags: true,
          sections: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
          },
          reviews: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      return course;
    }),

  // Create course
  create: editorProcedure
    .input(courseCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const { tags, ...data } = input;

      // Generate slug if not provided
      const slug = data.slug || data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check for existing slug
      const existing = await db.course.findUnique({
        where: { slug },
      });

      const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

      const course = await db.course.create({
        data: {
          ...data,
          slug: finalSlug,
          instructorId: ctx.userId,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
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
          instructor: { select: { id: true, name: true, image: true } },
          resource: true,
          tags: true,
        },
      });

      // Update resource course count
      await db.resource.update({
        where: { id: data.resourceId },
        data: { courseCount: { increment: 1 } },
      });

      return course;
    }),

  // Update course
  update: editorProcedure
    .input(courseUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, tags, ...data } = input;

      const existing = await db.course.findUnique({
        where: { id },
        select: { instructorId: true, status: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const userRole = ctx.role;
      if (existing.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      const publishedAt =
        data.status === "PUBLISHED" && existing.status !== "PUBLISHED"
          ? new Date()
          : undefined;

      const course = await db.course.update({
        where: { id },
        data: {
          ...data,
          publishedAt,
          lastUpdated: new Date(),
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
          instructor: { select: { id: true, name: true, image: true } },
          resource: true,
          tags: true,
        },
      });

      return course;
    }),

  // Delete course
  delete: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.course.findUnique({
        where: { id: input.id },
        select: { instructorId: true, resourceId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const userRole = ctx.role;
      if (existing.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own courses",
        });
      }

      await db.course.delete({
        where: { id: input.id },
      });

      await db.resource.update({
        where: { id: existing.resourceId },
        data: { courseCount: { decrement: 1 } },
      });

      return { success: true };
    }),

  // ==================== SECTIONS ====================

  // Create section
  createSection: editorProcedure
    .input(sectionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify course ownership
      const course = await db.course.findUnique({
        where: { id: input.courseId },
        select: { instructorId: true },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const userRole = ctx.role;
      if (course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      const section = await db.courseSection.create({
        data: input,
        include: {
          lessons: true,
        },
      });

      return section;
    }),

  // Update section
  updateSection: editorProcedure
    .input(sectionUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const section = await db.courseSection.findUnique({
        where: { id },
        include: { course: { select: { instructorId: true } } },
      });

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }

      const userRole = ctx.role;
      if (section.course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      const updated = await db.courseSection.update({
        where: { id },
        data,
        include: {
          lessons: true,
        },
      });

      return updated;
    }),

  // Delete section
  deleteSection: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const section = await db.courseSection.findUnique({
        where: { id: input.id },
        include: { course: { select: { instructorId: true } } },
      });

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }

      const userRole = ctx.role;
      if (section.course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      await db.courseSection.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Reorder sections
  reorderSections: editorProcedure
    .input(z.object({
      courseId: z.string(),
      sectionIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const course = await db.course.findUnique({
        where: { id: input.courseId },
        select: { instructorId: true },
      });

      if (!course) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Course not found",
        });
      }

      const userRole = ctx.role;
      if (course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      // Update order for each section
      await Promise.all(
        input.sectionIds.map((id, index) =>
          db.courseSection.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      return { success: true };
    }),

  // ==================== LESSONS ====================

  // Create lesson
  createLesson: editorProcedure
    .input(lessonCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const section = await db.courseSection.findUnique({
        where: { id: input.sectionId },
        include: { course: { select: { instructorId: true, id: true } } },
      });

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }

      const userRole = ctx.role;
      if (section.course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      const lesson = await db.courseLesson.create({
        data: input,
      });

      // Update section lesson count
      await db.courseSection.update({
        where: { id: input.sectionId },
        data: { lessonCount: { increment: 1 } },
      });

      // Update course lesson count
      await db.course.update({
        where: { id: section.course.id },
        data: { lessonCount: { increment: 1 } },
      });

      return lesson;
    }),

  // Update lesson
  updateLesson: editorProcedure
    .input(lessonUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const lesson = await db.courseLesson.findUnique({
        where: { id },
        include: {
          section: {
            include: { course: { select: { instructorId: true } } },
          },
        },
      });

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      const userRole = ctx.role;
      if (lesson.section.course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      const updated = await db.courseLesson.update({
        where: { id },
        data,
      });

      return updated;
    }),

  // Delete lesson
  deleteLesson: editorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const lesson = await db.courseLesson.findUnique({
        where: { id: input.id },
        include: {
          section: {
            include: { course: { select: { instructorId: true, id: true } } },
          },
        },
      });

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      const userRole = ctx.role;
      if (lesson.section.course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      await db.courseLesson.delete({
        where: { id: input.id },
      });

      // Update section lesson count
      await db.courseSection.update({
        where: { id: lesson.sectionId },
        data: { lessonCount: { decrement: 1 } },
      });

      // Update course lesson count
      await db.course.update({
        where: { id: lesson.section.course.id },
        data: { lessonCount: { decrement: 1 } },
      });

      return { success: true };
    }),

  // Reorder lessons
  reorderLessons: editorProcedure
    .input(z.object({
      sectionId: z.string(),
      lessonIds: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const section = await db.courseSection.findUnique({
        where: { id: input.sectionId },
        include: { course: { select: { instructorId: true } } },
      });

      if (!section) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }

      const userRole = ctx.role;
      if (section.course.instructorId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own courses",
        });
      }

      await Promise.all(
        input.lessonIds.map((id, index) =>
          db.courseLesson.update({
            where: { id },
            data: { order: index },
          })
        )
      );

      return { success: true };
    }),

  // ==================== ENROLLMENTS & REVIEWS ====================

  // Enroll in course
  enroll: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.userId,
            courseId: input.courseId,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Already enrolled in this course",
        });
      }

      const enrollment = await db.courseEnrollment.create({
        data: {
          userId: ctx.userId,
          courseId: input.courseId,
        },
      });

      // Update course enrollment count
      await db.course.update({
        where: { id: input.courseId },
        data: { enrollments: { increment: 1 } },
      });

      return enrollment;
    }),

  // Update progress
  updateProgress: protectedProcedure
    .input(z.object({
      courseId: z.string(),
      progress: z.number().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const enrollment = await db.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId: ctx.userId,
            courseId: input.courseId,
          },
        },
        data: {
          progress: input.progress,
          completed: input.progress >= 100,
          completedAt: input.progress >= 100 ? new Date() : null,
          lastAccessed: new Date(),
        },
      });

      return enrollment;
    }),

  // Add review
  addReview: protectedProcedure
    .input(z.object({
      courseId: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is enrolled
      const enrollment = await db.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: ctx.userId,
            courseId: input.courseId,
          },
        },
      });

      if (!enrollment) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You must be enrolled to review this course",
        });
      }

      const review = await db.courseReview.upsert({
        where: {
          userId_courseId: {
            userId: ctx.userId,
            courseId: input.courseId,
          },
        },
        create: {
          userId: ctx.userId,
          courseId: input.courseId,
          rating: input.rating,
          comment: input.comment,
        },
        update: {
          rating: input.rating,
          comment: input.comment,
        },
      });

      // Recalculate course rating
      const reviews = await db.courseReview.aggregate({
        where: { courseId: input.courseId },
        _avg: { rating: true },
        _count: true,
      });

      await db.course.update({
        where: { id: input.courseId },
        data: {
          rating: reviews._avg.rating || 0,
          ratingCount: reviews._count,
        },
      });

      return review;
    }),

  // Get tags
  getTags: publicProcedure.query(async ({ ctx }) => {
    return db.courseTag.findMany({
      orderBy: { name: "asc" },
    });
  }),
});

