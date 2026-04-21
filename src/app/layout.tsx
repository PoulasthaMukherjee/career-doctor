import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalChat from "@/components/GlobalChat";
import { auth } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CareerDoctor - AI-Powered Career Intelligence",
  description: "Upload your resume, get a full career diagnosis, chat with an AI coach that updates your profile, find jobs, and track applications. All in one place.",
  metadataBase: new URL('https://career-doctor.vercel.app'),
  openGraph: {
    title: "CareerDoctor - AI-Powered Career Intelligence",
    description: "Drop your resume. Get diagnosed. Chat with Doc. Land the job.",
    url: "https://career-doctor.vercel.app",
    siteName: "CareerDoctor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CareerDoctor - AI-Powered Career Intelligence",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerDoctor - AI-Powered Career Intelligence",
    description: "Drop your resume. Get diagnosed. Chat with Doc. Land the job.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        <ThemeProvider>
          <TopNav />
          <main className="flex-1">
            {children}
          </main>
          {session && <GlobalChat />}
          <Footer />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
