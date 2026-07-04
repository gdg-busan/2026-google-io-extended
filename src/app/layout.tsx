import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JotaiProvider } from "@/shared/lib";
import { EVENT_NAME } from "@/shared/config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: EVENT_NAME,
  description: EVENT_NAME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
