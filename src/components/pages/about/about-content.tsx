"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  IoLogoGithub, 
  IoLogoLinkedin, 
  IoLogoTwitter,
  IoMailOutline,
  IoCodeSlashOutline,
  IoRocketOutline,
  IoTrophyOutline
} from "react-icons/io5";

export function AboutContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero section animation (immediate on load)
    gsap.fromTo(
      ".about-hero",
      { opacity: 0, filter: "blur(15px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power2.out",
      }
    );

    // Biography section
    gsap.fromTo(
      ".about-bio",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-bio",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    // What I Do cards
    gsap.fromTo(
      ".what-i-do-card",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".what-i-do-section",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );

    // Tech stack sections
    gsap.fromTo(
      ".tech-section",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".tech-stack",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );

    // Experience section
    gsap.fromTo(
      ".experience-header",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".experience-section",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    gsap.fromTo(
      ".experience-card",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".experience-section",
          start: "top 70%",
          toggleActions: "play none none none",
        },
      }
    );

    // Education section
    gsap.fromTo(
      ".education-card",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".education-section",
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );

    // CTA section
    gsap.fromTo(
      ".cta-section",
      { opacity: 0, filter: "blur(10px)" },
      {
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".cta-section",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="py-12 px-2 md:px-4">
      {/* Hero Section */}
      <div className="about-hero max-w-6xl mx-auto mb-20">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Profile Image */}
          <div className="relative h-64 w-64 shrink-0 mx-auto md:mx-0">
            <div className="absolute inset-0 rounded-sm overflow-hidden border-2">
              <Image
                src="/me.jpg"
                alt="Sean Filimon"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Intro */}
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Sean Filimon
              </h1>
              <p className="text-xl text-muted-foreground">
                Technology Leader & Software Engineer
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <IoCodeSlashOutline className="h-4 w-4 text-muted-foreground" />
                <span>7+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <IoRocketOutline className="h-4 w-4 text-muted-foreground" />
                <span>100+ Projects Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTrophyOutline className="h-4 w-4 text-muted-foreground" />
                <span>Team of 7 Engineers</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <Button asChild variant="outline" size="icon" className="rounded-sm">
                <Link href="https://github.com/seanfilimon" target="_blank">
                  <IoLogoGithub className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" className="rounded-sm">
                <Link href="https://linkedin.com/in/seanfilimon" target="_blank">
                  <IoLogoLinkedin className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="icon" className="rounded-sm">
                <Link href="https://twitter.com/seanfilimon" target="_blank">
                  <IoLogoTwitter className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm gap-2">
                <Link href="/contact">
                  <IoMailOutline className="h-4 w-4" />
                  <span>Get in Touch</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Biography Section */}
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="about-bio border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">About Me</h2>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              Forward-thinking technology leader & software engineer driving the future of AI-powered software engineering. I built a full-stack AI app builder platform with seamless integrations across Neon, Together AI, DigitalOcean, Supabase, Figma, and GitHub, while also designing a GPU-accelerated Rust IDE for next-generation development.
            </p>
            
            <p>
              With expertise in deploying complex backend systems on AWS, GCP, and DigitalOcean, I have successfully scaled and managed high-performing engineering teams, forged strategic partnerships with major industry players, and delivered production-ready innovations at speed and scale.
            </p>

            <p className="text-lg font-semibold text-foreground">
              Now looking for the Next Big thing to work on!
            </p>
          </div>
        </div>

        {/* What I Do */}
        <div className="what-i-do-section border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">What I Do</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="what-i-do-card border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                <IoCodeSlashOutline className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Full-Stack Development</h3>
              <p className="text-muted-foreground">
                Building modern web applications from concept to deployment. Specializing 
                in Next.js, React, TypeScript, and scalable backend architectures.
              </p>
            </div>

            <div className="what-i-do-card border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                <IoTrophyOutline className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Technical Leadership</h3>
              <p className="text-muted-foreground">
                Leading engineering teams and making architectural decisions that scale. 
                Mentoring developers and fostering a culture of excellence.
              </p>
            </div>

            <div className="what-i-do-card border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                <IoRocketOutline className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Product Strategy</h3>
              <p className="text-muted-foreground">
                Turning ideas into successful products. From market research to launch 
                strategy, I help bring visions to life.
              </p>
            </div>

            <div className="what-i-do-card border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                <IoLogoGithub className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Content Creation</h3>
              <p className="text-muted-foreground">
                Creating educational content including tutorials, guides, and articles 
                to help developers grow their skills.
              </p>
            </div>
          </div>
        </div>

        {/* Technologies */}
        <div className="tech-stack border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Tech Stack</h2>
          
          <div className="space-y-8">
            {/* Frameworks */}
            <div className="tech-section">
              <h3 className="text-lg font-semibold mb-3">Frameworks</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Next.js", icon: "/ext-brands/next.svg" },
                  { name: "Nuxt.js", icon: "/ext-brands/nuxt.svg" },
                  { name: "React", icon: "/ext-brands/react.svg" },
                  { name: "Vue", icon: "/ext-brands/vue.svg" },
                  { name: "Svelte", icon: "/ext-brands/svelte.svg" },
                  { name: "Express", icon: "/ext-brands/expressjs.svg" },
                  { name: "NestJS", icon: "/ext-brands/nestjs-logo.svg" },
                  { name: "Fastify", icon: "/ext-brands/fastify.svg" },
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-2 px-4 py-2 border rounded-sm hover:bg-accent transition-colors">
                    <div className="relative h-4 w-4 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={tech.icon}
                        alt={tech.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="tech-section">
              <h3 className="text-lg font-semibold mb-4">Languages & APIs</h3>
              <div className="flex flex-wrap gap-3">
                {["TypeScript", "JavaScript", "Rust", "Golang", "C#", "Java", "Advanced APIs"].map((tech) => (
                  <span key={tech} className="px-4 py-2 border rounded-sm text-sm font-medium hover:bg-accent transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Cloud & Infrastructure */}
            <div className="tech-section">
              <h3 className="text-lg font-semibold mb-3">Cloud & Infrastructure</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "AWS", icon: "/ext-brands/aws.svg" },
                  { name: "GCP", icon: "/ext-brands/gcp.svg" },
                  { name: "Vercel", icon: "/ext-brands/vercel.svg" },
                  { name: "Azure", icon: "/ext-brands/azure.svg" },
                  { name: "DigitalOcean", icon: "/ext-brands/digital-ocean.svg" },
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-2 px-4 py-2 border rounded-sm hover:bg-accent transition-colors">
                    <div className="relative h-4 w-4 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={tech.icon}
                        alt={tech.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Integrations */}
            <div className="tech-section">
              <h3 className="text-lg font-semibold mb-3">Partner Integrations</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Together AI", icon: "/ext-brands/together-ai.svg" },
                  { name: "Supabase", icon: "/ext-brands/supabase.svg" },
                  { name: "GitHub", icon: "/ext-brands/github.svg" },
                  { name: "Figma", icon: "/ext-brands/figma.svg" },
                  { name: "Stripe", icon: "/ext-brands/stripe.svg" },
                  { name: "MongoDB", icon: "/ext-brands/mongodb.svg" },
                ].map((tech) => (
                  <div key={tech.name} className="flex items-center gap-2 px-4 py-2 border rounded-sm hover:bg-accent transition-colors">
                    <div className="relative h-4 w-4 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={tech.icon}
                        alt={tech.name}
                        width={16}
                        height={16}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DevOps & Security */}
            <div className="tech-section">
              <h3 className="text-lg font-semibold mb-4">DevOps & Security</h3>
              <div className="flex flex-wrap gap-3">
                {["CI/CD", "DevOps", "Code Optimization", "SCA", "SAST", "SIEM", "IAM", "Custom Frameworks"].map((tech) => (
                  <span key={tech} className="px-4 py-2 border rounded-sm text-sm font-medium hover:bg-accent transition-colors">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="experience-section border-t pt-12">
          <h2 className="experience-header text-3xl font-bold mb-8">Experience</h2>
          
          {/* LegionEdge - Featured Card */}
          <div className="experience-card border rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-primary/5 via-background to-muted/20">
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-3xl font-bold mb-2">LegionEdge</h3>
                  <p className="text-lg text-primary font-medium">Building the future of AI-powered software engineering</p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-sm">
                  CURRENT
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">1</span>
                    </div>
                    <p className="text-sm">Built a full-stack AI app builder platform with seamless integrations across 6 major companies (Neon, Together AI, DigitalOcean, Supabase, Figma, GitHub)</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">2</span>
                    </div>
                    <p className="text-sm">Designed and prototyped a Rust IDE with GPU-accelerated interface for next-gen development</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">3</span>
                    </div>
                    <p className="text-sm">Managed and scaled a team of 7 engineers to deliver production-ready innovations quickly and efficiently</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">4</span>
                    </div>
                    <p className="text-sm">Forged and maintained strategic partnerships with major industry players for both GTM and Market Positioning</p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">5</span>
                    </div>
                    <p className="text-sm">Managed and Deployed Complex Backend Systems on AWS, GCP and DigitalOcean</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Work */}
          <div className="experience-card border rounded-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Full-Time Contract Work & Independent Projects</h3>
                <p className="text-muted-foreground">7 Years of Building & Consulting</p>
              </div>
              <span className="px-3 py-1 text-xs font-bold border rounded-sm">
                2016 - 2023
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="border-l-2 border-primary pl-4">
                  <p className="font-bold text-foreground mb-1">Fleet Management Dashboard</p>
                  <p className="text-xs text-primary mb-2">Underscor</p>
                  <p className="text-sm text-muted-foreground">Built a logistics management platform with real-time fleet tracking, advanced analytics, and a scalable admin panel.</p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-bold text-foreground mb-1">Discrimination Guidance</p>
                  <p className="text-xs text-primary mb-2">Injury Compliance Software</p>
                  <p className="text-sm text-muted-foreground">Developed compliance-focused software enabling organizations to adhere to structured medical treatment plans.</p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-bold text-foreground mb-1">High-Volume Content Distribution</p>
                  <p className="text-xs text-primary mb-2">Rust CMS</p>
                  <p className="text-sm text-muted-foreground">Designed and deployed a Rust-based CMS optimized for scalability, handling millions of concurrent content requests.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-2 border-primary pl-4">
                  <p className="font-bold text-foreground mb-1">Collaborative Game Systems</p>
                  <p className="text-xs text-primary mb-2">Real-Time Multiplayer</p>
                  <p className="text-sm text-muted-foreground">Engineered multiple real-time multiplayer systems to support live user interactions with high concurrency.</p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-bold text-foreground mb-1">Minecraft Server Core</p>
                  <p className="text-xs text-primary mb-2">Java - High Performance</p>
                  <p className="text-sm text-muted-foreground">Developed a custom server core supporting 1,000+ concurrent players with near-zero latency by implementing a thread-per-region model and dedicated thread groups for player clusters.</p>
                </div>

                <div className="border-l-2 border-primary pl-4">
                  <p className="font-bold text-foreground mb-1">Discord Bot Management Platform</p>
                  <p className="text-xs text-primary mb-2">Bot Automation</p>
                  <p className="text-sm text-muted-foreground">Created a system for building and managing Discord bots, including support for custom commands, integrations, and automated workflows.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground italic">And many more projects across various domains...</p>
            </div>
          </div>
        </div>

        {/* Education & Certifications */}
        <div className="education-section border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Education & Certifications</h2>
          
          <div className="space-y-6">
            <div className="education-card border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-2">Wendell Krin Technical High School</h3>
              <p className="text-sm text-muted-foreground mb-3">2020 - 2023</p>
              <p className="text-muted-foreground">Cybersecurity, Cisco Packet Tracer (Networking, Configuration)</p>
            </div>

            <div className="education-card border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Certifications</h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-sm bg-muted/30">
                  <IoTrophyOutline className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Network Technology Associate - CIW</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-sm bg-muted/30">
                  <IoTrophyOutline className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Site Development Associate - CIW</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-sm bg-muted/30">
                  <IoTrophyOutline className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Internet Business Associate - CIW</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-sm bg-muted/30">
                  <IoTrophyOutline className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Web Foundations Associate - CIW</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t pt-12">
          <div className="cta-section border rounded-sm p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">Let&apos;s Work Together</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              I&apos;m always open to discussing new projects, creative ideas, or opportunities 
              to be part of your vision.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Button asChild className="rounded-sm font-bold uppercase">
                <Link href="/contact">Get In Touch</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm">
                <Link href="/projects">View My Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
