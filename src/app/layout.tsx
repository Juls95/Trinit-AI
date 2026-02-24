import type { Metadata } from "next";
import { Inter, Antonio } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import ClerkClientProvider from "@/components/ClerkClientProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trinit - AI Personal Finance",
  description: "Take control of your money with Trinit AI-powered personal finance agent",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${antonio.variable} font-sans antialiased bg-black text-white`}>
        <ClerkClientProvider>
          {children}
          <Analytics />
        </ClerkClientProvider>
      </body>
    </html>
  );
}
