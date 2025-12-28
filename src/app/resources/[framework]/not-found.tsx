import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoArrowBackOutline, IoSearchOutline } from "react-icons/io5";

export default function ResourceNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-muted">
          <IoSearchOutline className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Resource Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The resource you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
        <Button asChild>
          <Link href="/resources" className="inline-flex items-center gap-2">
            <IoArrowBackOutline className="h-4 w-4" />
            Back to Resources
          </Link>
        </Button>
      </div>
    </div>
  );
}



