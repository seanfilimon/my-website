import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { UnifiedNavbar } from "@/src/components/navigation/unified-navbar";
import { ConditionalFooter } from "@/src/components/layouts/conditional-footer";
import { ConditionalContainer } from "@/src/components/layouts/conditional-container";
import { ClientInitializer } from "@/src/components/wrappers/client-initializer";

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
    <html lang="en" className="dark">
      <body
        className={`${ubuntu.variable} ${ubuntuMono.variable} font-sans antialiased`}
      >
        <ClientInitializer />
        <UnifiedNavbar />
        <main className="pt-16 min-h-screen">
          <ConditionalContainer>
            {children}
          </ConditionalContainer>
        </main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
