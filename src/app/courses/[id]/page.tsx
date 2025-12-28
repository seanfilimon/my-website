import { notFound } from "next/navigation";
import { caller } from "@/src/lib/trpc/server";
import { CourseContent, CourseData } from "./course-content";

// Hardcoded fallback data for specific courses
const HARDCODED_COURSES: Record<string, CourseData> = {
  "nextjs-masterclass": {
    id: "nextjs-masterclass",
    title: "Next.js 16 Complete Masterclass",
    subtitle:
      "Learn Next.js from scratch and build production-ready applications",
    framework: "nextjs",
    frameworkName: "Next.js",
    instructor: "Sean Filimon",
    instructorTitle: "Founder & CEO at LegionEdge",
    instructorBio:
      "Full-stack developer with 10+ years of experience building scalable web applications",
    thumbnail: "/bg-pattern.png",
    price: "$49.99",
    discountPrice: "$29.99",
    rating: 4.8,
    totalRatings: 3250,
    students: "2,450",
    duration: "12 hours",
    lessons: 85,
    level: "Beginner",
    language: "English",
    lastUpdated: "October 2024",
    description:
      "Master Next.js 16 from the ground up. This comprehensive course covers everything from basic concepts to advanced patterns, including Server Components, App Router, data fetching, authentication, and deployment. Perfect for beginners and experienced developers looking to level up their Next.js skills.",
    whatYoullLearn: [
      "Build modern web applications with Next.js 16",
      "Master the App Router and file-based routing",
      "Understand Server Components vs Client Components",
      "Implement authentication and authorization",
      "Work with databases using Prisma and PostgreSQL",
      "Deploy Next.js apps to production",
      "Optimize performance and SEO",
      "Build and consume REST APIs",
    ],
    requirements: [
      "Basic knowledge of HTML, CSS, and JavaScript",
      "Familiarity with React is helpful but not required",
      "A computer with Node.js installed",
      "Enthusiasm to learn!",
    ],
    curriculum: [
      {
        section: "Getting Started",
        lessons: 8,
        duration: "45 min",
        items: [
          { title: "Welcome to the Course", duration: "3:24", free: true },
          { title: "Course Overview & Setup", duration: "8:15", free: true },
          {
            title: "Installing Node.js and VS Code",
            duration: "5:42",
            free: false,
          },
          {
            title: "Creating Your First Next.js App",
            duration: "10:33",
            free: false,
          },
          {
            title: "Understanding the Project Structure",
            duration: "7:18",
            free: false,
          },
          { title: "Next.js Configuration", duration: "6:45", free: false },
          {
            title: "Essential VS Code Extensions",
            duration: "4:52",
            free: false,
          },
          { title: "Getting Started Quiz", duration: "2:00", free: false },
        ],
      },
      {
        section: "App Router & Routing",
        lessons: 12,
        duration: "1h 30min",
        items: [
          {
            title: "Introduction to App Router",
            duration: "8:24",
            free: false,
          },
          { title: "File-based Routing", duration: "10:15", free: false },
          { title: "Dynamic Routes", duration: "12:42", free: false },
          { title: "Route Groups", duration: "9:33", free: false },
          { title: "Parallel Routes", duration: "11:18", free: false },
          { title: "Intercepting Routes", duration: "10:45", free: false },
          { title: "Layouts and Templates", duration: "8:52", free: false },
          { title: "Loading UI", duration: "7:20", free: false },
          { title: "Error Handling", duration: "9:15", free: false },
          { title: "Not Found Pages", duration: "5:30", free: false },
          { title: "Metadata and SEO", duration: "10:05", free: false },
          { title: "Routing Quiz", duration: "2:00", free: false },
        ],
      },
      {
        section: "Server & Client Components",
        lessons: 10,
        duration: "1h 15min",
        items: [
          {
            title: "Understanding Server Components",
            duration: "12:20",
            free: false,
          },
          {
            title: "When to Use Client Components",
            duration: "10:15",
            free: false,
          },
          {
            title: "The 'use client' Directive",
            duration: "8:30",
            free: false,
          },
          { title: "Composing Components", duration: "11:45", free: false },
          { title: "Streaming and Suspense", duration: "13:25", free: false },
          { title: "Server Actions", duration: "14:10", free: false },
          { title: "Data Fetching Patterns", duration: "10:50", free: false },
          { title: "Caching Strategies", duration: "9:20", free: false },
          { title: "Revalidation", duration: "8:15", free: false },
          { title: "Components Quiz", duration: "2:00", free: false },
        ],
      },
    ],
    features: [
      "Lifetime access to course materials",
      "Certificate of completion",
      "30-day money-back guarantee",
      "Direct Q&A with instructor",
      "Access to private Discord community",
      "Downloadable resources and code samples",
      "Regular updates with new content",
    ],
  },
};

async function getCourseData(idOrSlug: string): Promise<CourseData | null> {
  // 1. Try DB
  try {
    let course: any = null;
    try {
      course = await caller.course.bySlug({ slug: idOrSlug });
    } catch {
      try {
        course = await caller.course.byId({ id: idOrSlug });
      } catch {
        // Ignore errors if both fail
      }
    }

    if (course) {
      // Map DB course to CourseData
      return {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle || "",
        framework: course.resource.slug,
        frameworkName: course.resource.name,
        instructor: course.instructor.name || "Unknown Instructor",
        instructorTitle: course.instructor.title || "",
        instructorBio: course.instructor.bio || "",
        thumbnail: course.thumbnail || "/bg-pattern.png",
        price: Number(course.price) || 0,
        discountPrice: course.discountPrice
          ? Number(course.discountPrice)
          : null,
        rating: Number(course.rating) || 0,
        totalRatings: course.ratingCount || 0,
        students: course.enrollments || 0,
        duration: course.duration || "0h",
        lessons: course.lessonCount || 0,
        level: course.level, // BEGINNER, INTERMEDIATE, ADVANCED
        language: course.language || "English",
        lastUpdated: new Date(course.updatedAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        description: course.description,
        // Default empty arrays for fields not in schema yet
        whatYoullLearn: [],
        requirements: [],
        features: [],
        curriculum:
          course.sections?.map((section: any) => ({
            section: section.title,
            lessons: section.lessonCount || section.lessons?.length || 0,
            duration: section.duration || "",
            items:
              section.lessons?.map((lesson: any) => ({
                title: lesson.title,
                duration: lesson.duration,
                free: lesson.isFree,
              })) || [],
          })) || [],
      };
    }
  } catch (e) {
    console.error("Error fetching course from DB:", e);
  }

  // 2. Fallback
  return HARDCODED_COURSES[idOrSlug] || null;
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseData(id);

  if (!course) {
    notFound();
  }

  return <CourseContent course={course} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourseData(id);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: `${course.title} | Sean Filimon`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      type: "website",
      images: course.thumbnail ? [{ url: course.thumbnail }] : [],
    },
  };
}
