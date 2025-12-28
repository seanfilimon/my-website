"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  IoLogoGithub, 
  IoLogoLinkedin, 
  IoLogoTwitter,
  IoMailOutline,
  IoArrowUpOutline
} from "react-icons/io5";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t bg-muted/10">
      <div className="w-full">
        <div className="container max-w-7xl mx-auto px-4 border-l border-r py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full shrink-0">
                  <Image
                    src="/me.jpg"
                    alt="Sean Filimon"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">Sean Filimon</div>
                  <div className="text-xs text-muted-foreground">Founder & CEO</div>
                </div>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                Full-stack developer helping build the future of software engineers.
              </p>
              {/* Social Links */}
              <div className="flex gap-2">
                <Link
                  href="https://github.com/seanfilimon"
                  target="_blank"
                  className="flex items-center justify-center h-9 w-9 rounded-sm border hover:bg-accent transition-colors"
                >
                  <IoLogoGithub className="h-4 w-4" />
                </Link>
                <Link
                  href="https://linkedin.com/in/seanfilimon"
                  target="_blank"
                  className="flex items-center justify-center h-9 w-9 rounded-sm border hover:bg-accent transition-colors"
                >
                  <IoLogoLinkedin className="h-4 w-4" />
                </Link>
                <Link
                  href="https://twitter.com/seanfilimon"
                  target="_blank"
                  className="flex items-center justify-center h-9 w-9 rounded-sm border hover:bg-accent transition-colors"
                >
                  <IoLogoTwitter className="h-4 w-4" />
                </Link>
                <Link
                  href="mailto:sean@seanfilimon.com"
                  className="flex items-center justify-center h-9 w-9 rounded-sm border hover:bg-accent transition-colors"
                >
                  <IoMailOutline className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog Posts
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                    Development Guides
                  </Link>
                </li>
                <li>
                  <Link href="/tutorials" className="text-muted-foreground hover:text-foreground transition-colors">
                    Video Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="/snippets" className="text-muted-foreground hover:text-foreground transition-colors">
                    Code Snippets
                  </Link>
                </li>
              </ul>
            </div>

            {/* Projects */}
            <div>
              <h3 className="font-semibold mb-4">Projects</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                    Starter Templates
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-muted-foreground hover:text-foreground transition-colors">
                    Open Source
                  </Link>
                </li>
                <li>
                  <Link href="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
                    Developer Tools
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-muted-foreground hover:text-foreground transition-colors">
                    All Resources
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Me
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/newsletter" className="text-muted-foreground hover:text-foreground transition-colors">
                    Newsletter
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Sean Filimon. All rights reserved.
            </div>
            
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              Back to Top
              <IoArrowUpOutline className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
