import { Metadata } from "next";
import { caller } from "@/src/lib/trpc/server";
import { TutorialsContent } from "@/src/app/resources/tutorials/tutorials-content";

export const metadata: Metadata = {
  title: "Courses | Sean Filimon",
  description:
    "Comprehensive courses and tutorials on modern web development, Next.js, React, and software engineering.",
  openGraph: {
    title: "Courses | Sean Filimon",
    description:
      "Comprehensive courses and tutorials on modern web development, Next.js, React, and software engineering.",
  },
};

async function getCoursesData() {
  try {
    const coursesResult = await caller.course.list({
      status: "PUBLISHED",
      limit: 100,
    });

    return {
      courses: coursesResult.courses,
    };
  } catch (error) {
    console.error("Error fetching courses data:", error);
    return {
      courses: [],
    };
  }
}

export default async function CoursesPage() {
  const { courses } = await getCoursesData();

  return <TutorialsContent courses={courses} />;
}
