"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoMailOutline,
  IoLogoGithub,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoLocationOutline,
  IoChatbubbleEllipsesOutline,
  IoSendOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoMicOutline,
  IoVideocamOutline,
  IoNewspaperOutline,
  IoCalendarOutline
} from "react-icons/io5";

export function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="py-12 px-2 md:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Get in Touch
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind or want to collaborate? Let&apos;s talk.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left - Contact Form */}
          <div>
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                <IoChatbubbleEllipsesOutline className="h-5 w-5" />
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Input */}
                <div>
                  <label htmlFor="name" className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Name *
                  </label>
                  <div className="relative">
                    <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Email *
                  </label>
                  <div className="relative">
                    <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                {/* Company Input */}
                <div>
                  <label htmlFor="company" className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Company (Optional)
                  </label>
                  <div className="relative">
                    <IoBusinessOutline className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    />
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label htmlFor="message" className="text-xs font-medium mb-1.5 block text-muted-foreground">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell me about your project or how I can help..."
                    className="w-full px-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="sm"
                  className="w-full rounded-sm font-bold"
                  disabled={submitted}
                >
                  {submitted ? (
                    <>Message Sent!</>
                  ) : (
                    <>
                      <IoSendOutline className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right - Contact Info */}
          <div className="space-y-6">
            {/* Contact Details */}
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-bold mb-5">
                Contact Information
              </h2>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-sm bg-primary/10 text-primary shrink-0">
                    <IoMailOutline className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Email</div>
                    <a
                      href="mailto:sean@seanfilimon.com"
                      className="text-sm font-semibold hover:text-primary transition-colors"
                    >
                      sean@seanfilimon.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-sm bg-primary/10 text-primary shrink-0">
                    <IoLocationOutline className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Location</div>
                    <div className="text-sm font-semibold">
                      San Francisco, CA
                    </div>
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center h-9 w-9 rounded-sm bg-primary/10 text-primary shrink-0">
                    <IoChatbubbleEllipsesOutline className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-0.5">Response Time</div>
                    <div className="text-sm font-semibold">
                      Within 24 hours
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-bold mb-5">
                Social Links
              </h2>

              <div className="flex flex-wrap gap-2">
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

                <Button asChild variant="outline" size="icon" className="rounded-sm">
                  <Link href="mailto:sean@seanfilimon.com">
                    <IoMailOutline className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Availability - Compact */}
            <div className="border rounded-lg p-6 bg-card border-primary/50">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse mt-2 shrink-0" />
                <div>
                  <h3 className="text-base font-bold mb-1">
                    Open to Opportunities
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Available for speaking engagements, podcasts, interviews, and collaboration opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Contact Options */}
        <div className="mt-12 pt-12 border-t">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Other Ways to Connect
            </h2>
            <p className="text-sm text-muted-foreground">
              Looking for specific opportunities? Here&apos;s how we can work together
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Speaking Engagements */}
            <div className="border rounded-lg p-5 bg-card hover:border-primary transition-colors group flex flex-col">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                <IoMicOutline className="h-5 w-5" />
              </div>
              <h3 className="font-bold mb-2">Speaking</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Conference talks, workshops, and tech events
              </p>
              <Button asChild variant="outline" size="sm" className="w-full rounded-sm text-xs">
                <Link href="mailto:sean@seanfilimon.com?subject=Speaking Engagement">
                  Book Me
                </Link>
              </Button>
            </div>

            {/* Podcast/Interviews */}
            <div className="border rounded-lg p-5 bg-card hover:border-primary transition-colors group flex flex-col">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                <IoVideocamOutline className="h-5 w-5" />
              </div>
              <h3 className="font-bold mb-2">Podcasts</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Guest appearances and interviews
              </p>
              <Button asChild variant="outline" size="sm" className="w-full rounded-sm text-xs">
                <Link href="mailto:sean@seanfilimon.com?subject=Podcast Interview">
                  Invite Me
                </Link>
              </Button>
            </div>

            {/* Media/Press */}
            <div className="border rounded-lg p-5 bg-card hover:border-primary transition-colors group flex flex-col">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                <IoNewspaperOutline className="h-5 w-5" />
              </div>
              <h3 className="font-bold mb-2">Media</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Press inquiries and media requests
              </p>
              <Button asChild variant="outline" size="sm" className="w-full rounded-sm text-xs">
                <Link href="mailto:sean@seanfilimon.com?subject=Media Inquiry">
                  Contact
                </Link>
              </Button>
            </div>

            {/* Collaboration */}
            <div className="border rounded-lg p-5 bg-card hover:border-primary transition-colors group flex flex-col">
              <div className="flex items-center justify-center h-10 w-10 rounded-sm bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform">
                <IoCalendarOutline className="h-5 w-5" />
              </div>
              <h3 className="font-bold mb-2">Collaborate</h3>
              <p className="text-xs text-muted-foreground mb-4 flex-grow">
                Partnership and collaboration opportunities
              </p>
              <Button asChild variant="outline" size="sm" className="w-full rounded-sm text-xs">
                <Link href="mailto:sean@seanfilimon.com?subject=Collaboration">
                  Let&apos;s Talk
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
