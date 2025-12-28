import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { UnifiedNavbar } from "@/src/components/navigation/unified-navbar";
import { ConditionalFooter } from "@/src/components/layouts/conditional-footer";
import { ConditionalContainer } from "@/src/components/layouts/conditional-container";
import { ClientInitializer } from "@/src/components/wrappers/client-initializer";
import { PageTransition } from "@/src/components/transitions/page-transition";
import { TRPCProvider } from "@/src/components/providers/trpc-provider";
import { Toaster } from "@/src/components/ui/sonner";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://seanfilimon.com",
  ),
  title: {
    default: "Sean Filimon | Developer, Creator, Builder",
    template: "%s | Sean Filimon",
  },
  description:
    "Full-stack developer, founder, and content creator helping build the future of software engineers. Specialized in Next.js, React, and modern web technologies.",
  keywords: [
    "Next.js",
    "React",
    "JavaScript",
    "TypeScript",
    "Web Development",
    "Software Engineering",
    "Sean Filimon",
  ],
  authors: [{ name: "Sean Filimon", url: "https://seanfilimon.com" }],
  creator: "Sean Filimon",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://seanfilimon.com",
    title: "Sean Filimon | Developer, Creator, Builder",
    description:
      "Full-stack developer, founder, and content creator helping build the future of software engineers.",
    siteName: "Sean Filimon",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Sean Filimon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Filimon | Developer, Creator, Builder",
    description:
      "Full-stack developer, founder, and content creator helping build the future of software engineers.",
    images: ["/og.png"],
    creator: "@seanfilimon",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${ubuntu.variable} ${ubuntuMono.variable} font-sans antialiased`}
        >
          <TRPCProvider>
            <ClientInitializer />
            <UnifiedNavbar />
            <main className="pt-16 min-h-screen">
              <ConditionalContainer>
                <PageTransition>{children}</PageTransition>
              </ConditionalContainer>
            </main>
            <ConditionalFooter />
            <Toaster position="bottom-right" />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
