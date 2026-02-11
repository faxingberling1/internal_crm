import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "Internal CRM Dashboard",
  description: "State-of-the-art CRM for proposal and lead management",
};

import { UserProvider } from "@/components/user-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900 h-screen overflow-hidden`}
      >
        <UserProvider>
          <div className="flex h-screen w-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
