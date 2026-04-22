import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaServiceWorker } from "@/app/components/layout/PwaServiceWorker";
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
  title: "My Task Magage",
  description: "My Task Magage",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/task-management.ico",
    shortcut: "/task-management.ico",
    apple: "/task-management.ico",
  },
  applicationName: "My Task Magage",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Task Magage",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} min-h-dvh antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans antialiased">
        <PwaServiceWorker />
        {children}
      </body>
    </html>
  );
}
