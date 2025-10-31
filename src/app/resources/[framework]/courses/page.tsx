"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import {
  IoArrowForwardOutline,
  IoTimeOutline,
  IoHomeOutline,
  IoChevronForwardOutline,
  IoGridOutline,
  IoListOutline,
  IoSearchOutline,
  IoPlayCircleOutline,
  IoStarOutline
} from "react-icons/io5";

const frameworkData: Record<string, any> = {
  nextjs: {
    name: "Next.js",
    courses: [
      {
        id: 1,
        title: "Next.js 16 Complete Masterclass",
        thumbnail: "/bg-pattern.png",
        duration: "12 hours",
        lessons: 85,
        level: "Beginner",
        price: "$49.99",
        rating: 4.8,
        students: "2,450",
        href: "/courses/nextjs-masterclass"
      }
    ]
  }
};

export default function FrameworkCoursesPage() {
  const params = useParams();
  const framework = params.framework as string;
  const data = frameworkData[framework];
  const [view, setView] = useState<'grid' | 'list'>('grid');

  if (!data) {
    return <div>Framework not found</div>;
  }

  return (
    <main className="resources-content flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden">
      <div className="border-b bg-muted/5">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm mb-4">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <IoHomeOutline className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <Link href={`/resources/${framework}`} className="text-muted-foreground hover:text-foreground transition-colors">{data.name}</Link>
            <IoChevronForwardOutline className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-foreground font-medium">Courses</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{data.name} Courses</h1>
              <p className="text-sm text-muted-foreground">Comprehensive video courses</p>
            </div>
            <div className="flex items-center gap-1 border rounded-sm p-1">
              <button onClick={() => setView('grid')} className={`p-2 rounded-sm ${view === 'grid' ? 'bg-accent' : ''}`}>
                <IoGridOutline className="h-4 w-4" />
              </button>
              <button onClick={() => setView('list')} className={`p-2 rounded-sm ${view === 'list' ? 'bg-accent' : ''}`}>
                <IoListOutline className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.courses.map((course: any) => (
                <Link key={course.id} href={course.href} className="group flex flex-col gap-3 text-sm cursor-pointer">
                  <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted/20">
                    <Image src={course.thumbnail} alt={course.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2"><span className={`px-2 py-1 text-xs font-medium backdrop-blur border rounded-sm shadow ${course.level === 'Beginner' ? 'bg-green-500/90 text-white' : course.level === 'Intermediate' ? 'bg-blue-500/90 text-white' : 'bg-purple-500/90 text-white'}`}>{course.level}</span></div>
                  </div>
                  <div className="flex flex-col gap-2 pb-1 pl-1">
                    <span className="line-clamp-2 font-medium leading-tight">{course.title}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><IoTimeOutline className="h-3 w-3" />{course.duration}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">{course.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium">Course</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Level</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Duration</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Lessons</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Rating</th>
                    <th className="text-right px-4 py-3 text-sm font-medium">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.courses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3"><Link href={course.href} className="flex items-center gap-3 group-hover:text-primary"><div className="relative w-16 h-10 flex-shrink-0 overflow-hidden rounded bg-muted/20"><Image src={course.thumbnail} alt={course.title} fill className="object-cover" /></div><span className="font-medium">{course.title}</span></Link></td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-sm ${course.level === 'Beginner' ? 'bg-green-500/10 text-green-700' : 'bg-blue-500/10 text-blue-700'}`}>{course.level}</span></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{course.duration}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{course.lessons}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><IoStarOutline className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" /><span>{course.rating}</span></div></td>
                      <td className="px-4 py-3 text-right font-bold">{course.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

