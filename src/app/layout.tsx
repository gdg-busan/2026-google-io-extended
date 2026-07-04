import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JotaiProvider } from "@/shared/lib";
import { EVENT_NAME } from "@/shared/config";
import { SessionBootstrap } from "@/entities/session";
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
  description: `${EVENT_NAME} · Builder Board — 로그인 없이 참여하는 행사 웹앱`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <JotaiProvider>
          <SessionBootstrap />
          {children}
        </JotaiProvider>
      </body>
    </html>
  );
}
