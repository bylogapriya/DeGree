import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono, Comfortaa } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import SupabaseListener from "@/components/SupabaseListener";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin"],
});

export const metadata = {
  manifest: '/manifest.json',
}
export const metadata: Metadata = {
  title: "DeGree",
  description: "Academic PWA Platform for Students",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DeGree",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
