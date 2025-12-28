import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoArrowBackOutline } from "react-icons/io5";

export default function ExperienceNotFound() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="mb-8">
          <span className="text-6xl">🔍</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Experience Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The experience you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" className="rounded-sm gap-2">
            <Link href="/portfolio">
              <IoArrowBackOutline className="h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
          <Button asChild className="rounded-sm font-bold text-black dark:text-black">
            <Link href="/contact">Contact Me</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
