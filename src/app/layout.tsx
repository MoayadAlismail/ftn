import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FTN - One Place For Opportunity Providers & Candidates",
    template: "%s | FTN"
  },
  description: "FTN-Find streamlines hiring with AI-powered talent matching. Connect opportunity providers with qualified candidates through advanced filtering, resume analysis, and intelligent job recommendations.",
  keywords: ["talent matching", "job board", "hiring platform", "AI recruitment", "career opportunities", "Saudi Arabia jobs", "talent acquisition", "recruitment software"],
  authors: [{ name: "FTN Team" }],
  creator: "FTN",
  publisher: "FTN",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ftn.sa"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_SA",
    url: "/",
    title: "FTN - One Place For Opportunity Providers & Candidates",
    description: "Connect with opportunity providers or find your dream job with FTN's AI-powered matching platform. Smart hiring made simple.",
    siteName: "FTN",
    images: [
      {
        url: "/logo.svg",
        width: 46,
        height: 48,
        alt: "FTN Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "FTN - One Place For Opportunity Providers & Candidates",
    description: "Connect with opportunity providers or find your dream job with FTN's AI-powered matching platform.",
    images: ["/logo.svg"],
    creator: "@FTN"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg"
  },
  manifest: "/site.webmanifest",
  applicationName: "FTN",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FTN"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#944ADB" },
    { media: "(prefers-color-scheme: dark)", color: "#944ADB" }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="auto">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${sora.variable} antialiased font-sans`}
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <LoadingProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LoadingProvider>
        </LanguageProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
