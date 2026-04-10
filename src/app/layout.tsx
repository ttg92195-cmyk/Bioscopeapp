import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ThemeSync from "./components/ThemeSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bioscope Streaming - Myanmar Movies & Series",
  description: "Watch Myanmar subtitle movies and series online. Stream the latest movies, TV shows, and exclusive content.",
  keywords: ["Myanmar movies", "streaming", "movies", "series", "Bioscope"],
  authors: [{ name: "Bioscope Team" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my" className="dark" suppressHydrationWarning style={{ backgroundColor: '#0a0a0a' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}
        style={{ backgroundColor: '#0a0a0a', color: '#ffffff' }}
      >
        <ThemeSync />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
