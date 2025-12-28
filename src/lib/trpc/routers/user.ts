import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../init";
import { db } from "@/src/lib/db";

// Input validation schemas
const userCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  image: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  github: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  linkedin: z.string().max(100).optional(),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"]).default("AUTHOR"),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
  website: z.string().url().optional().or(z.literal("")),
  github: z.string().max(100).optional(),
  twitter: z.string().max(100).optional(),
  linkedin: z.string().max(100).optional(),
});

const userListSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"]).optional(),
  search: z.string().optional(),
  orderBy: z.enum(["createdAt", "lastActiveAt", "name"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const userRouter = createTRPCRouter({
  // Get current user profile
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      include: {
        _count: {
          select: {
            articles: true,
            blogs: true,
            courses: true,
            videos: true,
            experiences: true,
            comments: true,
            enrollments: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Update current user profile
  updateMe: protectedProcedure
    .input(userUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await db.user.update({
        where: { id: ctx.userId },
        data: input,
      });

      return user;
    }),

  // Get user by ID (public profile)
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          image: true,
          bio: true,
          title: true,
          website: true,
          github: true,
          twitter: true,
          linkedin: true,
          createdAt: true,
          _count: {
            select: {
              articles: { where: { status: "PUBLISHED" } },
              blogs: { where: { status: "PUBLISHED" } },
              courses: { where: { status: "PUBLISHED" } },
              videos: { where: { status: "PUBLISHED" } },
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  // Get user's published content
  getContent: publicProcedure
    .input(z.object({
      userId: z.string(),
      type: z.enum(["articles", "blogs", "courses", "videos"]).optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { userId, type, limit } = input;

      const result: any = {};

      if (!type || type === "articles") {
        result.articles = await db.article.findMany({
          where: { authorId: userId, status: "PUBLISHED" },
          take: limit,
          orderBy: { publishedAt: "desc" },
          include: {
            resource: { select: { name: true, slug: true, icon: true } },
            category: { select: { name: true, slug: true } },
          },
        });
      }

      if (!type || type === "blogs") {
        result.blogs = await db.blog.findMany({
          where: { authorId: userId, status: "PUBLISHED" },
          take: limit,
          orderBy: { publishedAt: "desc" },
          include: {
            resource: { select: { name: true, slug: true, icon: true } },
            category: { select: { name: true, slug: true } },
          },
        });
      }

      if (!type || type === "courses") {
        result.courses = await db.course.findMany({
          where: { instructorId: userId, status: "PUBLISHED" },
          take: limit,
          orderBy: { publishedAt: "desc" },
          include: {
            resource: { select: { name: true, slug: true, icon: true } },
          },
        });
      }

      if (!type || type === "videos") {
        result.videos = await db.video.findMany({
          where: { authorId: userId, status: "PUBLISHED" },
          take: limit,
          orderBy: { publishedAt: "desc" },
          include: {
            resource: { select: { name: true, slug: true, icon: true } },
          },
        });
      }

      return result;
    }),

  // ==================== ADMIN OPERATIONS ====================

  // Get all authors (for select dropdowns)
  getAuthors: publicProcedure.query(async () => {
    const authors = await db.user.findMany({
      where: {
        role: { in: ["ADMIN", "EDITOR", "AUTHOR"] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
    return authors;
  }),

  // Create a new user/author (admin only)
  create: adminProcedure
    .input(userCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if email already exists
      const existing = await db.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A user with this email already exists",
        });
      }

      const user = await db.user.create({
        data: {
          ...input,
          website: input.website || null,
        },
      });

      return user;
    }),

  // List all users (admin only)
  list: adminProcedure
    .input(userListSchema)
    .query(async ({ ctx, input }) => {
      const { limit, cursor, orderBy, order, search, role } = input;

      const where: any = {};

      if (role) where.role = role;

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      const users = await db.user.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [orderBy]: order },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          createdAt: true,
          lastActiveAt: true,
          _count: {
            select: {
              articles: true,
              blogs: true,
              courses: true,
              videos: true,
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (users.length > limit) {
        const nextItem = users.pop();
        nextCursor = nextItem?.id;
      }

      return {
        users,
        nextCursor,
      };
    }),

  // Get user details (admin only)
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              articles: true,
              blogs: true,
              courses: true,
              videos: true,
              experiences: true,
              comments: true,
              enrollments: true,
              reviews: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return user;
    }),

  // Update user role (admin only)
  updateRole: adminProcedure
    .input(z.object({
      userId: z.string(),
      role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"]),
    }))
    .mutation(async ({ ctx, input }) => {
      // Prevent changing own role
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot change your own role",
        });
      }

      const user = await db.user.update({
        where: { id: input.userId },
        data: { role: input.role },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return user;
    }),

  // Update any user (admin only)
  updateUser: adminProcedure
    .input(z.object({
      userId: z.string(),
      name: z.string().min(1).max(100).optional(),
      bio: z.string().max(500).optional(),
      title: z.string().max(100).optional(),
      website: z.string().url().optional().or(z.literal("")),
      github: z.string().max(100).optional(),
      twitter: z.string().max(100).optional(),
      linkedin: z.string().max(100).optional(),
      role: z.enum(["ADMIN", "EDITOR", "AUTHOR", "VIEWER"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, ...data } = input;

      const user = await db.user.update({
        where: { id: userId },
        data,
      });

      return user;
    }),

  // Delete user (admin only)
  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Prevent deleting self
      if (input.userId === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot delete your own account",
        });
      }

      // Check if user exists
      const user = await db.user.findUnique({
        where: { id: input.userId },
        include: {
          _count: {
            select: {
              articles: true,
              blogs: true,
              courses: true,
              videos: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const totalContent =
        user._count.articles +
        user._count.blogs +
        user._count.courses +
        user._count.videos;

      if (totalContent > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `Cannot delete user with ${totalContent} content items. Reassign or delete content first.`,
        });
      }

      await db.user.delete({
        where: { id: input.userId },
      });

      return { success: true };
    }),

  // Get user statistics (admin only)
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, roleBreakdown, recentUsers] = await Promise.all([
      db.user.count(),
      db.user.groupBy({
        by: ["role"],
        _count: true,
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalUsers,
      roleBreakdown: roleBreakdown.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentUsers,
    };
  }),

  // ==================== ENROLLMENTS ====================

  // Get user's enrolled courses
  getEnrollments: protectedProcedure
    .input(z.object({
      completed: z.boolean().optional(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const where: any = { userId: ctx.userId };
      if (input.completed !== undefined) {
        where.completed = input.completed;
      }

      return db.courseEnrollment.findMany({
        where,
        take: input.limit,
        orderBy: { lastAccessed: "desc" },
        include: {
          course: {
            include: {
              instructor: { select: { id: true, name: true, image: true } },
              resource: { select: { name: true, slug: true, icon: true } },
            },
          },
        },
      });
    }),

  // ==================== COMMENTS ====================

  // Get user's comments
  getComments: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ ctx, input }) => {
      return db.comment.findMany({
        where: { userId: ctx.userId },
        take: input.limit,
        orderBy: { createdAt: "desc" },
        include: {
          article: { select: { id: true, title: true, slug: true } },
          blog: { select: { id: true, title: true, slug: true } },
          video: { select: { id: true, title: true, slug: true } },
        },
      });
    }),

  // Create comment
  createComment: protectedProcedure
    .input(z.object({
      content: z.string().min(1).max(2000),
      articleId: z.string().optional(),
      blogId: z.string().optional(),
      videoId: z.string().optional(),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Ensure at least one target is provided
      if (!input.articleId && !input.blogId && !input.videoId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Comment must be associated with an article, blog, or video",
        });
      }

      const comment = await db.comment.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      return comment;
    }),

  // Update comment
  updateComment: protectedProcedure
    .input(z.object({
      id: z.string(),
      content: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.comment.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      if (existing.userId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own comments",
        });
      }

      const comment = await db.comment.update({
        where: { id: input.id },
        data: { content: input.content },
      });

      return comment;
    }),

  // Delete comment
  deleteComment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await db.comment.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        });
      }

      const userRole = ctx.role;
      if (existing.userId !== ctx.userId && userRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      await db.comment.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Moderate comment (admin only)
  moderateComment: adminProcedure
    .input(z.object({
      id: z.string(),
      approved: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const comment = await db.comment.update({
        where: { id: input.id },
        data: { approved: input.approved },
      });

      return comment;
    }),
});

