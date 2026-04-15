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
  title: "DeGree",
  description: "Academic PWA Platform for Students",
  manifest: "/manifest.json",
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