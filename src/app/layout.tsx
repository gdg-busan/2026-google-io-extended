import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JotaiProvider } from "@/shared/lib";
import { EVENT_NAME } from "@/shared/config";
import { SessionBootstrap } from "@/entities/session";
import "@radix-ui/themes/styles.css";
import "./theme.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";

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
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Theme
          appearance="light"
          accentColor="blue"
          grayColor="slate"
          radius="large"
          scaling="100%"
        >
          <JotaiProvider>
            <SessionBootstrap />
            {children}
          </JotaiProvider>
        </Theme>
      </body>
    </html>
  );
}
