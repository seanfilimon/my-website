"use client";

import { useSearchParams } from "next/navigation";
import { UnifiedCreator } from "@/components/admin/unified-creator";
import { ContentType } from "@/src/lib/admin/types";

export default function CreatePage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") as ContentType | null;
  
  return <UnifiedCreator initialType={initialType} />;
}
