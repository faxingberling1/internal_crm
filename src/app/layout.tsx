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
import { Header } from "@/components/header";
import { UserProvider } from "@/components/user-context";

export const metadata: Metadata = {
  title: "Internal CRM Dashboard",
  description: "State-of-the-art CRM for proposal and lead management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505] text-zinc-100 h-screen overflow-hidden`}
      >
        <UserProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative">
              <Header />
              <main className="flex-1 overflow-y-auto p-10 relative isolate">
                {/* Global Architectural Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/5 blur-[120px] -z-10 pointer-events-none" />

                <div className="max-w-[1600px] mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
