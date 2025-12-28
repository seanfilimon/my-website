import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoArrowBackOutline } from "react-icons/io5";

export default function BlogNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Blog Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The blog post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="rounded-sm gap-2">
          <Link href="/blogs">
            <IoArrowBackOutline className="h-4 w-4" />
            Back to Blogs
          </Link>
        </Button>
      </div>
    </div>
  );
}
