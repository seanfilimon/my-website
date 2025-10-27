import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoLogoGithub, 
  IoLogoLinkedin, 
  IoLogoTwitter,
  IoMailOutline,
  IoLocationOutline,
  IoCodeSlashOutline,
  IoRocketOutline,
  IoTrophyOutline
} from "react-icons/io5";

export const metadata = {
  title: "About Me | Sean Filimon",
  description: "Full-stack developer, founder, and content creator helping build the future of software engineers.",
};

export default function AboutPage() {
  return (
    <div className="py-12 px-2 md:px-4">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Profile Image */}
          <div className="relative h-64 w-64 shrink-0 mx-auto md:mx-0">
            <div className="absolute inset-0 rounded-sm overflow-hidden border-2">
              <Image
                src="/face_grayscale_nobg.png"
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
                Founder & CEO, Software Engineer, AI Researcher, Content Creator
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <IoLocationOutline className="h-4 w-4 text-muted-foreground" />
                <span>San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-2">
                <IoCodeSlashOutline className="h-4 w-4 text-muted-foreground" />
                <span>5+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2">
                <IoRocketOutline className="h-4 w-4 text-muted-foreground" />
                <span>50+ Projects Launched</span>
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
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Biography</h2>
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              I&apos;m a full-stack developer passionate about creating modern web experiences 
              that push the boundaries of what&apos;s possible. With over 5 years of experience 
              in the industry, I&apos;ve helped build products that serve millions of users worldwide.
            </p>
            
            <p>
              My journey in software development began with a fascination for how things work 
              under the hood. This curiosity led me to explore everything from frontend frameworks 
              to backend architectures, database optimization to cloud infrastructure. Today, 
              I specialize in building scalable applications using cutting-edge technologies 
              like Next.js, React, TypeScript, and modern deployment platforms.
            </p>

            <p>
              As the Founder & CEO of my own ventures, I&apos;ve learned that great software is 
              about more than just code—it&apos;s about solving real problems for real people. 
              I approach every project with a user-first mindset, focusing on performance, 
              accessibility, and intuitive design.
            </p>

            <p>
              Beyond building products, I&apos;m deeply invested in the developer community. Through 
              my blog, tutorials, and open-source contributions, I share knowledge and help other 
              developers level up their skills. I believe in learning in public and giving back 
              to the community that has given me so much.
            </p>
          </div>
        </div>

        {/* What I Do */}
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">What I Do</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                <IoCodeSlashOutline className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Full-Stack Development</h3>
              <p className="text-muted-foreground">
                Building modern web applications from concept to deployment. Specializing 
                in Next.js, React, TypeScript, and scalable backend architectures.
              </p>
            </div>

            <div className="border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                <IoTrophyOutline className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Technical Leadership</h3>
              <p className="text-muted-foreground">
                Leading engineering teams and making architectural decisions that scale. 
                Mentoring developers and fostering a culture of excellence.
              </p>
            </div>

            <div className="border rounded-sm p-6 space-y-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-sm bg-primary text-primary-foreground">
                <IoRocketOutline className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">Product Strategy</h3>
              <p className="text-muted-foreground">
                Turning ideas into successful products. From market research to launch 
                strategy, I help bring visions to life.
              </p>
            </div>

            <div className="border rounded-sm p-6 space-y-3">
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
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-6">Technologies I Work With</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js", "React", "TypeScript", "Node.js", "PostgreSQL",
              "Prisma", "tRPC", "TailwindCSS", "GSAP", "Stripe",
              "Inngest", "Better Auth", "Vercel", "Docker", "AWS"
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 border rounded-sm text-sm font-medium hover:bg-accent transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border-t pt-12">
          <div className="border rounded-sm p-8 text-center space-y-4">
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

