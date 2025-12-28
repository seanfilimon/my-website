import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IoArrowBackOutline,
  IoHomeOutline,
  IoDocumentTextOutline
} from "react-icons/io5";

export default function ArticleNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <IoDocumentTextOutline className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-6xl font-bold mb-2">404</h1>
          <h2 className="text-2xl font-bold mb-3">Article Not Found</h2>
          <p className="text-muted-foreground">
            The article you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-sm gap-2">
            <Link href="/resources">
              <IoArrowBackOutline className="h-4 w-4" />
              Browse Resources
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-sm gap-2">
            <Link href="/">
              <IoHomeOutline className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


