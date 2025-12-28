"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  IoHomeOutline, 
  IoChevronForwardOutline, 
  IoSearchOutline,
  IoArrowForwardOutline,
  IoTimeOutline,
  IoMenuOutline,
  IoCloseOutline,
  IoBookOutline,
  IoPlayCircleOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import { ResourcesMobileMenu } from "@/src/components/pages/resources/resources-mobile-menu";
import { Badge } from "@/components/ui/badge";

interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  duration: string | null;
  level: string | null;
  createdAt: Date;
  instructor: { id: string; name: string | null; image: string | null } | null;
  resource: { id: string; name: string; slug: string; icon: string; color: string } | null;
  tags: { id: string; name: string }[];
  _count: { sections: number; enrolledUsers: number; reviews: number };
}

interface TutorialsContentProps {
  courses: Course[];
}

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export function TutorialsContent({ courses }: TutorialsContentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesLevel = selectedLevel === "All" || course.level?.toLowerCase() === selectedLevel.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      course.tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  // Auto-scroll delegation
  useEffect(() => {
    const content = sectionRef.current;
    if (!content) return;

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      const isOverSidebar = target.closest('.resources-sidebar-wrapper');
      const isOverContent = target.closest('.resources-content');
      
      if (!isOverSidebar && !isOverContent) {
        content.scrollBy({
          top: e.deltaY,
          left: e.deltaX,
          behavior: 'auto'
        });
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    if (sectionRef.current) {
      sectionRef.current.style.scrollBehavior = 'smooth';
    }

    // Animate breadcrumb
    gsap.fromTo(
      ".breadcrumb-section",
      { opacity: 0, y: -15 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power3.out",
        delay: 0.1
      }
    );

    // Animate course cards
    gsap.fromTo(
      ".course-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".courses-container",
          start: "top 75%",
          toggleActions: "play none none none",
          scroller: ".resources-content"
        }
      }
    );

    const content = sectionRef.current;
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      if (content) {
        content.style.scrollBehavior = 'auto';
      }
    };
  }, [selectedLevel, searchTerm]);

  return (
    <>
      <main ref={sectionRef} className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Breadcrumb Section */}
        <div className="breadcrumb-section border-b bg-muted/5">
          <div className="w-full px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <IoHomeOutline className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
                <IoChevronForwardOutline className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-foreground">Tutorials</span>
              </div>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-sm hover:bg-accent transition-colors">
                {mobileMenuOpen ? (
                  <>
                    <IoCloseOutline className="h-4 w-4" />
                    <span>Close</span>
                  </>
                ) : (
                  <>
                    <IoMenuOutline className="h-4 w-4" />
                    <span>Menu</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Step-by-step guides and hands-on tutorials</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="w-full px-4 py-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {levels.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${
                    selectedLevel === level
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="courses-container py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {selectedLevel === "All" ? "All Tutorials" : `${selectedLevel} Tutorials`}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'tutorial' : 'tutorials'}
            </span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <IoBookOutline className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {courses.length === 0 
                  ? "No tutorials published yet. Check back soon!"
                  : "No tutorials found matching your criteria."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="course-card group relative flex w-full flex-col gap-3 text-sm cursor-pointer select-none"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border hover:shadow-sm transition-all duration-300 bg-muted/20">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover transition-all duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <IoPlayCircleOutline className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}

                    {/* Level Badge */}
                    {course.level && (
                      <div className="absolute top-2 left-2 z-20">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm shadow ${
                          course.level.toLowerCase() === 'beginner' 
                            ? 'bg-green-500/90 text-white' 
                            : course.level.toLowerCase() === 'intermediate'
                            ? 'bg-yellow-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                        }`}>
                          {course.level}
                        </span>
                      </div>
                    )}

                    {/* Duration Badge */}
                    {course.duration && (
                      <div className="absolute bottom-2 right-2 z-20">
                        <span className="px-2 py-1 text-xs font-medium bg-black/70 text-white rounded-sm">
                          {course.duration}
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-medium">Start Learning</span>
                        <IoArrowForwardOutline className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex items-center gap-3 pb-1 pl-1">
                    <div className="flex flex-1 flex-col gap-2">
                      {/* Title */}
                      <div className="flex items-start gap-2">
                        <span className="line-clamp-2 font-medium leading-tight transition-colors duration-300 select-none">
                          {course.title}
                        </span>
                      </div>

                      {/* Subtitle */}
                      {course.subtitle && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {course.subtitle}
                        </p>
                      )}

                      {/* Resource Badge */}
                      {course.resource && (
                        <Badge variant="outline" className="w-fit text-xs">
                          {course.resource.name}
                        </Badge>
                      )}

                      {/* Meta Info */}
                      <div className="flex min-w-0 items-center gap-3 text-xs text-muted-foreground">
                        {course._count.sections > 0 && (
                          <span className="flex items-center gap-1">
                            <IoBookOutline className="h-3 w-3" />
                            {course._count.sections} sections
                          </span>
                        )}
                        {course._count.enrolledUsers > 0 && (
                          <span className="flex items-center gap-1">
                            <IoPeopleOutline className="h-3 w-3" />
                            {course._count.enrolledUsers}
                          </span>
                        )}
                      </div>

                      {/* Instructor */}
                      {course.instructor && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {course.instructor.image && (
                            <Image
                              src={course.instructor.image}
                              alt={course.instructor.name || "Instructor"}
                              width={16}
                              height={16}
                              className="rounded-full"
                            />
                          )}
                          <span>{course.instructor.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <ResourcesMobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
