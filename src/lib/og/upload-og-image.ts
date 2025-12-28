/**
 * OG Image Upload Helper
 * Generates OG images and uploads them to UploadThing
 */
import { UTApi } from "uploadthing/server";
import { generateBlogOGBuffer } from "./generate-blog-og";

const utapi = new UTApi();

interface UploadBlogOGOptions {
  title: string;
  excerpt?: string;
  authorName?: string;
  blogId?: string;
}

/**
 * Generate a blog OG image and upload it to UploadThing
 * Returns the uploaded image URL or null if failed
 */
export async function generateAndUploadBlogOG({
  title,
  excerpt,
  authorName,
  blogId,
}: UploadBlogOGOptions): Promise<string | null> {
  try {
    console.log(`[OG] Generating OG image for: "${title}"`);
    
    // Generate the image as ArrayBuffer
    const imageBuffer = await generateBlogOGBuffer({
      title,
      excerpt,
      authorName,
    });

    // Convert ArrayBuffer to Blob for upload
    const blob = new Blob([imageBuffer], { type: "image/png" });
    
    // Create a File object with a meaningful name
    const fileName = `og-${blogId || Date.now()}-${slugify(title)}.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    // Upload to UploadThing
    const uploadResult = await utapi.uploadFiles([file]);
    
    if (uploadResult[0]?.error) {
      console.error("[OG] Upload failed:", uploadResult[0].error);
      return null;
    }

    const uploadedUrl = uploadResult[0]?.data?.ufsUrl || uploadResult[0]?.data?.url;
    
    if (uploadedUrl) {
      console.log(`[OG] Successfully uploaded OG image: ${uploadedUrl}`);
      return uploadedUrl;
    }

    console.error("[OG] Upload succeeded but no URL returned");
    return null;
  } catch (error) {
    console.error("[OG] Failed to generate/upload OG image:", error);
    return null;
  }
}

/**
 * Simple slugify function for file names
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

