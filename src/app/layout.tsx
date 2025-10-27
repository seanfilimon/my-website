import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { UnifiedNavbar } from "@/src/components/navigation/unified-navbar";
import { SmoothScrollWrapper } from "@/src/components/wrappers/smooth-scroll-wrapper";
import { ThemeProvider } from "@/src/components/providers/theme-provider";
import { ConditionalFooter } from "@/src/components/layouts/conditional-footer";

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
  title: "Sean Filimon",
  description: "Developer, Creator, Builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${ubuntu.variable} ${ubuntuMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
        <SmoothScrollWrapper>
            <UnifiedNavbar />
          <main className="pt-16">
            <div className="container max-w-7xl mx-auto border-l border-r min-h-screen">
              {children}
            </div>
          </main>
            <ConditionalFooter />
        </SmoothScrollWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
