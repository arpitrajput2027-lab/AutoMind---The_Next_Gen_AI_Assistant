import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AutoMind — The Next Gen AI Assistant",
  description:
    "Control your computer with natural language. AutoMind combines conversational AI with real system-level automation.",
  keywords: ["AI assistant", "automation", "voice control", "natural language"],
  openGraph: {
    title: "AutoMind — The Next Gen AI Assistant",
    description: "Command your PC. AutoMind does the rest.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${ibmMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
