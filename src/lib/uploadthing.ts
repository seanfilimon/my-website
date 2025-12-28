import { createUploadthing, type FileRouter } from "uploadthing/next";
// import { UploadThingError } from "uploadthing/server"; // Uncomment when adding auth

const f = createUploadthing();

// File router for UploadThing
export const ourFileRouter = {
  // Thumbnail uploader - for blog/article/course/video thumbnails
  thumbnailUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // TODO: Add auth check here when needed
      // const user = await auth(req);
      // if (!user) throw new UploadThingError("Unauthorized");
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Thumbnail uploaded:", file.url);
      return { url: file.ufsUrl };
    }),

  // Cover image uploader - for larger cover images
  coverImageUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Cover image uploaded:", file.url);
      return { url: file.ufsUrl };
    }),

  // Avatar uploader - for user/author profile images
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploaded:", file.url);
      return { url: file.ufsUrl };
    }),

  // Icon uploader - for resource icons
  iconUploader: f({ image: { maxFileSize: "1MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Icon uploaded:", file.url);
      return { url: file.ufsUrl };
    }),

  // Gallery uploader - for multiple images (experiences, etc.)
  galleryUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async ({ req }) => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Gallery image uploaded:", file.url);
      return { url: file.ufsUrl };
    }),

  // General file uploader - for documents, etc.
  fileUploader: f({
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "16MB" },
  })
    .middleware(async ({ req }) => {
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File uploaded:", file.url);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
