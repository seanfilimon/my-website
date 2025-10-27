"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  IoLocationOutline,
  IoArrowForwardOutline
} from "react-icons/io5";

export function QuickAbout() {
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aboutRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Content animation - slide in from left
    gsap.fromTo(
      ".about-content",
      { opacity: 0, x: -50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-content",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Image animation - slide in from right
    gsap.fromTo(
      ".about-image",
      { opacity: 0, x: 50 },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".about-image",
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Stats animation - fade in from bottom
    gsap.fromTo(
      ".about-stats",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-stats",
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={aboutRef} className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="about-content space-y-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                About Me
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                I&apos;m Sean, a full-stack developer passionate about building tools and sharing 
                knowledge that helps developers create better software, faster.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With over 5 years in the industry, I&apos;ve worked with startups and enterprise 
                companies to build scalable applications. Now I focus on creating educational 
                content and open-source tools to give back to the community.
              </p>
            </div>

            {/* Location */}
            <div className="about-stats py-4">
              <div className="flex items-center gap-2 text-sm">
                <IoLocationOutline className="h-4 w-4 text-muted-foreground" />
                <span>I travel a lot</span>
              </div>
            </div>

            <Button asChild className="rounded-sm font-bold uppercase w-full md:w-auto">
              <Link href="/about" className="flex items-center justify-center gap-2">
                Learn More About Me
                <IoArrowForwardOutline className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Profile Image */}
          <div className="about-image">
            <div className="relative">
              <div className="relative h-96 w-full rounded-sm overflow-hidden border-2">
                <Image
                  src="/face_grayscale_nobg.png"
                  alt="Sean Filimon"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 h-24 w-24 border-2 border-primary/20 rounded-sm -z-10" />
              <div className="absolute -bottom-4 -right-4 h-32 w-32 border-2 border-primary/10 rounded-sm -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
