import { createTRPCRouter } from "../init";
import { articleRouter } from "./article";
import { assetRouter } from "./asset";
import { blogRouter } from "./blog";
import { courseRouter } from "./course";
import { videoRouter } from "./video";
import { experienceRouter } from "./experience";
import { resourceRouter } from "./resource";
import { userRouter } from "./user";
import { homeRouter } from "./home";
import { seoRouter } from "./seo";

/**
 * Main application router
 * Merges all domain-specific routers into a single API
 */
export const appRouter = createTRPCRouter({
  article: articleRouter,
  asset: assetRouter,
  blog: blogRouter,
  course: courseRouter,
  video: videoRouter,
  experience: experienceRouter,
  resource: resourceRouter,
  user: userRouter,
  home: homeRouter,
  seo: seoRouter,
});

export type AppRouter = typeof appRouter;
