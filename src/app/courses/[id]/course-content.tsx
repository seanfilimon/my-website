"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoPlayCircleOutline,
  IoStarOutline,
  IoCheckmarkCircleOutline,
  IoPersonOutline,
  IoLanguageOutline,
  IoChatbubbleOutline,
  IoTrophyOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoDownloadOutline
} from "react-icons/io5";

export interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  framework: string;
  frameworkName: string;
  instructor: string;
  instructorTitle?: string;
  instructorBio?: string;
  thumbnail: string;
  price: string | number;
  discountPrice: string | number | null;
  rating: number | string;
  totalRatings: number;
  students: number | string;
  duration: string;
  lessons: number;
  level: string;
  language: string;
  lastUpdated: string;
  description: string;
  whatYoullLearn: string[];
  requirements: string[];
  curriculum: {
    section: string;
    lessons: number;
    duration: string;
    items: {
      title: string;
      duration: string;
      free?: boolean;
    }[];
  }[];
  features: string[];
}

interface CourseContentProps {
  course: CourseData;
}

export function CourseContent({ course }: CourseContentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero animation
    gsap.fromTo(
      ".course-hero",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
      }
    );

    // Content sections animation
    gsap.fromTo(
      ".content-section",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".content-section",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <main ref={sectionRef} className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/50 via-background to-muted/30 border-b">
        <div className="max-w-7xl mx-auto">
          {/* Back to Resources Button */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="rounded-sm">
              <Link href={`/resources/${course.framework}`} className="flex items-center gap-2">
                <IoArrowForwardOutline className="h-4 w-4 rotate-180" />
                Back to {course.frameworkName} Resources
              </Link>
            </Button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <IoHomeOutline className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link
              href="/resources"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Resources
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link
              href={`/resources/${course.framework}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {course.frameworkName}
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Course</span>
          </div>

          <div className="course-hero grid lg:grid-cols-2 gap-8 items-start">
            {/* Left: Course Info */}
            <div>
              <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-sm mb-4 ${
                course.level === 'Beginner' || course.level === 'BEGINNER' ? 'bg-green-500/10 text-green-700 dark:text-green-400' :
                course.level === 'Intermediate' || course.level === 'INTERMEDIATE' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                'bg-purple-500/10 text-purple-700 dark:text-purple-400'
              }`}>
                {course.level} Level
              </span>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6">
                {course.subtitle}
              </p>

              {/* Rating & Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <IoStarOutline className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{course.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({course.totalRatings} ratings)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IoPersonOutline className="h-4 w-4" />
                  <span>{course.students} students</span>
                </div>
              </div>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <IoTimeOutline className="h-4 w-4" />
                  <span>{course.duration} total</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoPlayCircleOutline className="h-4 w-4" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoLanguageOutline className="h-4 w-4" />
                  <span>{course.language}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <IoPersonOutline className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                  <p className="font-semibold">{course.instructor}</p>
                </div>
              </div>
            </div>

            {/* Right: Preview & Purchase */}
            <div className="lg:sticky lg:top-4">
              <div className="border rounded-lg overflow-hidden bg-card shadow-lg">
                {/* Video Preview */}
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-primary rounded-full p-6 cursor-pointer hover:scale-110 transition-transform">
                      <IoPlayCircleOutline className="h-12 w-12 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Purchase Card */}
                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-bold">{course.discountPrice}</span>
                    <span className="text-xl text-muted-foreground line-through">{course.price}</span>
                  </div>

                  <Button className="w-full mb-3 rounded-sm" size="lg">
                    Enroll Now
                  </Button>
                  <Button variant="outline" className="w-full rounded-sm" size="lg">
                    Add to Cart
                  </Button>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    30-day money-back guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <div className="content-section">
              <h2 className="text-3xl font-bold mb-6">What You'll Learn</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {course.whatYoullLearn.map((item: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="content-section">
              <h2 className="text-3xl font-bold mb-4">Course Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {course.description}
              </p>
            </div>

            {/* Curriculum */}
            <div className="content-section">
              <h2 className="text-3xl font-bold mb-6">Course Curriculum</h2>
              <div className="space-y-4">
                {course.curriculum.map((section: any, sectionIndex: number) => (
                  <details key={sectionIndex} className="group border rounded-lg" open={sectionIndex === 0}>
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div>
                        <h3 className="font-semibold mb-1">{section.section}</h3>
                        <p className="text-sm text-muted-foreground">
                          {section.lessons} lessons • {section.duration}
                        </p>
                      </div>
                      <IoChevronForwardOutline className="h-5 w-5 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="border-t">
                      {section.items.map((lesson: any, lessonIndex: number) => (
                        <div key={lessonIndex} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors border-b last:border-b-0">
                          <div className="flex items-center gap-3">
                            <IoPlayCircleOutline className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {lesson.free && (
                              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">Preview</span>
                            )}
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="content-section">
              <h2 className="text-3xl font-bold mb-6">Requirements</h2>
              <ul className="space-y-3">
                {course.requirements.map((req: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* This Course Includes */}
              <div className="content-section border rounded-lg p-6 bg-card">
                <h3 className="font-bold mb-4">This Course Includes</h3>
                <ul className="space-y-3">
                  {course.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <IoCheckmarkCircleOutline className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share */}
              <div className="content-section border rounded-lg p-6 bg-card">
                <h3 className="font-bold mb-4">Share This Course</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-sm">
                    <IoChatbubbleOutline className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-sm">
                    <IoDownloadOutline className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Back to Resources */}
              <div className="content-section border rounded-lg p-6 bg-card">
                <h3 className="font-bold mb-4">Explore More</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full rounded-sm justify-start" size="sm">
                    <Link href={`/resources/${course.framework}#courses`}>
                      <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                      All {course.frameworkName} Courses
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-sm justify-start" size="sm">
                    <Link href={`/resources/${course.framework}#articles`}>
                      <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                      {course.frameworkName} Articles
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full rounded-sm justify-start" size="sm">
                    <Link href="/resources">
                      <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                      All Resources
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA - Back to Resources */}
      <section className="border-t bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Continue Learning?</h2>
          <p className="text-muted-foreground mb-6">
            Explore more courses, articles, and resources to master {course.frameworkName}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-sm">
              <Link href={`/resources/${course.framework}`}>
                <IoArrowForwardOutline className="h-4 w-4 mr-2 rotate-180" />
                Browse {course.frameworkName} Resources
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-sm">
              <Link href="/resources">View All Resources</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
