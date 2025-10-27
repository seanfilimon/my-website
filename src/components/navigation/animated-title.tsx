"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const titles = [
  "Founder & CEO",
  "Software Engineer",
  "AI Researcher",
  "Content Creator",
];

export function AnimatedTitle() {
  const titleRef = useRef<HTMLSpanElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!titleRef.current) return;

    const timeline = gsap.timeline({ repeat: -1 });

    titles.forEach((_, index) => {
      timeline
        .to(titleRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        })
        .call(() => {
          setCurrentIndex((index + 1) % titles.length);
        })
        .to(titleRef.current, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        })
        .to({}, { duration: 4 }); // Hold for 4 seconds
    });

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <span
      ref={titleRef}
      className="text-[10px] text-muted-foreground uppercase tracking-wider leading-tight block w-32 text-left"
    >
      {titles[currentIndex]}
    </span>
  );
}

