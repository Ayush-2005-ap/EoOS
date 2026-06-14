import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

import { Suspense } from "react";
import PageTransition from "@/components/PageTransition";
import LaunchGuard from "@/components/LaunchGuard";

export const metadata: Metadata = {
  title: "EoOS Index | India Education Analytics & Ranking Platform",
  description:
    "Explore official state-wise education rankings across India, customize indicator weightages in real-time, and analyze state profiles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface font-inter">
        <Suspense fallback={null}>
          <PageTransition />
        </Suspense>
        <LaunchGuard>
          {children}
        </LaunchGuard>
      </body>
    </html>
  );
}
