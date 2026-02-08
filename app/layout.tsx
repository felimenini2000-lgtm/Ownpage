import React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "NETIDIA | IT Infrastructure, Software Development & Technology Services",
  description:
    "NETIDIA is a technology company specializing in IT infrastructure, software development, and digital solutions for businesses seeking stability, security, and scalability.",

  icons: {
    icon: "/icon.png",          // favicon navegador
    shortcut: "/icon.png",
    apple: "/icon.png",         // iPhone/iPad
  },

  openGraph: {
    title: "NETIDIA | IT Infrastructure & Software Development",
    description:
      "Technology solutions for businesses seeking stability, security, and scalability.",
    url: "https://netidia.com", // ← cambiá por tu dominio real
    siteName: "NETIDIA",
    images: [
      {
        url: "/icon.png",   // ← imagen preview
        width: 1200,
        height: 630,
        alt: "NETIDIA Technology Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "NETIDIA | IT Infrastructure & Software Development",
    description:
      "Technology solutions for businesses seeking stability, security, and scalability.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
