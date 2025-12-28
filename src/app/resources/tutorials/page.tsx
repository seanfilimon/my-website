import { Metadata } from "next";
import { caller } from "@/src/lib/trpc/server";
import { TutorialsContent } from "./tutorials-content";

export const metadata: Metadata = {
  title: "Tutorials | Resources | Sean Filimon",
  description:
    "Step-by-step guides and hands-on tutorials for learning modern web development technologies.",
  openGraph: {
    title: "Tutorials | Resources | Sean Filimon",
    description:
      "Step-by-step guides and hands-on tutorials for learning modern web development technologies.",
  },
};

async function getTutorialsData() {
  try {
    const coursesResult = await caller.course.list({
      status: "PUBLISHED",
      limit: 100,
    });

    return {
      courses: coursesResult.courses,
    };
  } catch (error) {
    console.error("Error fetching tutorials data:", error);
    return {
      courses: [],
    };
  }
}

export default async function TutorialsPage() {
  const { courses } = await getTutorialsData();

  return <TutorialsContent courses={courses} />;
}
