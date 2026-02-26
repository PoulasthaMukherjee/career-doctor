import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalChat from "@/components/GlobalChat";
import { auth } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerDoctor — AI-Powered Job Search Tracker",
  description: "Track your job applications, analyze your strategy, and get AI-powered insights to land your dream role.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider>
          <TopNav />
          <main className="flex-1">
            {children}
          </main>
          {session && <GlobalChat />}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
