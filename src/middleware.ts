import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Admin emails that have access to the admin panel
const ADMIN_EMAILS = [
  "s.filimon@legionedge.ai",
  "seanfilimon@icloud.com",
];

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/blogs(.*)",
  "/articles(.*)",
  "/courses(.*)",
  "/videos(.*)",
  "/resources(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)", // SSO callback for OAuth redirects
  "/api/trpc(.*)", // Allow tRPC routes (they handle their own auth)
  "/api/experiences(.*)",
  "/api/github(.*)",
  "/api/home(.*)",
]);

// Define admin routes that require admin role
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes
  if (isPublicRoute(req)) {
    return;
  }

  // Protect admin routes - require authentication AND admin email
  if (isAdminRoute(req)) {
    const { userId } = await auth.protect();
    
    try {
      // Get user details from Clerk
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userEmail = user.emailAddresses?.[0]?.emailAddress;
      
      // Check if user's email is in the admin list
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail.toLowerCase())) {
        // Redirect non-admin users to home page
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
