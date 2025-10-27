import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import {
  lastLoginMethod,
  jwt,
  captcha,
  admin,
  magicLink,
  username,
} from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: !!process.env.GOOGLE_CLIENT_ID,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      enabled: !!process.env.GITHUB_CLIENT_ID,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      enabled: !!process.env.DISCORD_CLIENT_ID,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session every day)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },

  user: {
    additionalFields: {
      bio: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      website: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [
    // Track last login method (email, google, github, etc.)
    lastLoginMethod({
      storeInDatabase: true,
      cookieName: "better-auth.last_login_method",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    }),

    // JWT tokens for external API authentication
    jwt({
      jwt: {
        issuer: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        audience: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        expirationTime: "15m",
      },
      jwks: {
        keyPairConfig: {
          alg: "EdDSA",
          crv: "Ed25519",
        },
      },
    }),

    // Captcha protection for sign-up and sign-in
    // Uncomment and configure when ready to use
    // captcha({
    //   provider: "cloudflare-turnstile", // or "google-recaptcha", "hcaptcha", "captchafox"
    //   secretKey: process.env.TURNSTILE_SECRET_KEY as string,
    //   // Apply captcha to these endpoints
    //   endpoints: ["signUp", "signIn"],
    // }),

    // Admin plugin for managing users
    admin({
      defaultRole: "user",
      // Define admin impersonation rules
      impersonationSessionDuration: 60 * 60, // 1 hour
    }),

    // Magic link authentication (passwordless)
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        // Implement your email sending logic here
        console.log(`Magic link for ${email}: ${url}`);
        
        // Example with Resend:
        // await resend.emails.send({
        //   from: "noreply@example.com",
        //   to: email,
        //   subject: "Sign in to your account",
        //   html: `<p>Click <a href="${url}">here</a> to sign in.</p>`,
        // });
      },
      expiresIn: 60 * 5, // 5 minutes
    }),

    // Username support (optional alternative to email)
    username(),
  ],

  // Advanced security options
  advanced: {
    cookiePrefix: "better-auth",
    crossSubDomainCookies: {
      enabled: false,
      domain: undefined, // Set to your domain for cross-subdomain support
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    generateId: () => crypto.randomUUID(),
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    window: 60, // 60 seconds
    max: 10, // 10 requests per window
    storage: "memory", // or "database"
  },

  // Trust proxy headers (for deployment behind reverse proxy)
  trustedOrigins: process.env.NEXT_PUBLIC_APP_URL
    ? [process.env.NEXT_PUBLIC_APP_URL]
    : ["http://localhost:3000"],
});

/**
 * Export auth API for server-side usage
 */
export const { 
  api: authAPI,
  handler: authHandler 
} = auth;

/**
 * Type exports for better TypeScript support
 */
export type Session = typeof auth.$Infer.Session.session & {
  user: typeof auth.$Infer.Session.user;
};
export type User = typeof auth.$Infer.Session.user;

