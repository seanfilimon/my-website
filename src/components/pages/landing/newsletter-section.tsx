"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  IoMailOutline,
  IoSendOutline,
  IoCheckmarkCircleOutline,
  IoLogoDiscord,
  IoPeopleOutline
} from "react-icons/io5";

const slides = [
  {
    id: "newsletter",
    icon: IoMailOutline,
    title: "Stay in the Loop",
    description: "Join 10,000+ developers getting the latest insights on entrepreneurship, cutting-edge tutorials, and behind-the-scenes company building.",
    action: {
      type: "form" as const,
      buttonText: "Subscribe",
      buttonIcon: IoSendOutline,
      placeholder: "Enter your email address",
      footnote: "Free • No spam • Unsubscribe anytime"
    }
  },
  {
    id: "discord",
    icon: IoLogoDiscord,
    title: "Join Our Community",
    description: "Connect with 5,000+ developers in our Discord. Get help, share projects, and collaborate with like-minded builders.",
    action: {
      type: "link" as const,
      buttonText: "Join Discord Server",
      buttonIcon: IoPeopleOutline,
      href: "https://discord.gg/seanfilimon",
      footnote: "Active community • Free forever"
    }
  }
];

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <section className="w-full py-6 px-4 bg-muted/10 border-t border-b border-border relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto">
        {/* Carousel Content */}
        <div className="relative">
          <div
            key={currentSlide}
            className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 animate-in fade-in slide-in-from-right-4 duration-500"
          >
          {/* Left: Header & Description */}
          <div className="flex-shrink-0 text-center lg:text-left space-y-1 lg:max-w-md">
            <h3 className="text-xl font-bold flex items-center justify-center lg:justify-start gap-2">
                <Icon className="h-5 w-5 text-primary" />
                {slide.title}
            </h3>
            <p className="text-sm text-muted-foreground">
                {slide.description}
            </p>
          </div>

            {/* Right: Action Form/Button */}
          <div className="w-full lg:w-auto lg:min-w-[450px]">
              {slide.action.type === "form" ? (
                <>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                      placeholder={slide.action.placeholder}
                className="flex-1 sm:min-w-[300px] px-3 py-2 text-sm rounded-sm border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              />
                    <Button size="sm" className="rounded-sm font-bold px-4 whitespace-nowrap">
                      <slide.action.buttonIcon className="h-4 w-4 mr-2" />
                      {slide.action.buttonText}
              </Button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-muted-foreground mt-2">
              <IoCheckmarkCircleOutline className="h-3.5 w-3.5 text-green-500" />
                    <span>{slide.action.footnote}</span>
                  </div>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="rounded-sm font-bold w-full">
                    <a href={slide.action.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <slide.action.buttonIcon className="h-5 w-5" />
                      {slide.action.buttonText}
                    </a>
                  </Button>
                  <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs text-muted-foreground mt-2">
                    <IoCheckmarkCircleOutline className="h-3.5 w-3.5 text-green-500" />
                    <span>{slide.action.footnote}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dots Navigation */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-6 bg-primary" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
