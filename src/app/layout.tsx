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
    <html lang="my" className="dark" suppressHydrationWarning style={{ backgroundColor: '#0d0d0d' }}>

    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            var s = JSON.parse(localStorage.getItem('bioscope-settings') || '{}');
            var c = s.state && s.state.primaryColor ? s.state.primaryColor : '#E53935';
            document.documentElement.style.setProperty('--dynamic-primary', c);
          } catch(e) {}
        `,
      }}
    />
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}
        style={{ backgroundColor: '#0d0d0d', color: '#ffffff' }}
      >
        <ThemeSync />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
