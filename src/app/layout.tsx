import type { Metadata, Viewport } from "next";
import { Inter, IBM_Plex_Mono, Comfortaa } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import SupabaseListener from "@/components/SupabaseListener";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = IBM_Plex_Mono({ weight: ["400", "700"], variable: "--font-mono", subsets: ["latin"] });
const comfortaa = Comfortaa({ variable: "--font-comfortaa", subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#9061CB",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  // CRITICAL: This tells bots the base address of your site
  metadataBase: new URL('https://de-gree.vercel.app'), 
  title: "DeGree",
  description: "Academic PWA Platform for Students",
  manifest: "/manifest.json",
  openGraph: {
    title: "DeGree Academic Vault",
    description: "Your centralized student resource platform.",
    url: "https://de-gree.vercel.app", 
    siteName: "DeGree",
    images: [
      {
        url: "/opengraph-image.png", // Ensure this file is in your /public folder
        width: 1200,
        height: 630,
        alt: "DeGree Platform Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/logo-degree.png",
    apple: "/logo-degree.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable} ${comfortaa.variable} antialiased`}>
      <body className="font-sans">
        <SupabaseListener />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}