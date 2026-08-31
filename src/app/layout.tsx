import "@/styles/globals.css";
import React from "react";
import { AuthRoleProvider } from "@/lib/context/AuthRoleContext";
import { SplashPreloader } from "@/components/layout/SplashPreloader";
import { CommandPalette } from "@/components/layout/CommandPalette";

import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#111827",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "AGRI-NOVA | AI Agriculture, Livestock & Agri-Commerce Management Platform",
    template: "%s | AGRI-NOVA",
  },
  description: "Enterprise-grade AI-powered smart farming ecosystem connecting Farmers, Buyers, Equipment Owners, Veterinary Experts, Delivery Partners, and Admins.",
  keywords: ["agriculture", "AI farming", "agri-commerce", "livestock management", "smart farming"],
  authors: [{ name: "AGRI-NOVA Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://agri-nova.com",
    title: "AGRI-NOVA | Smart Farming Ecosystem",
    description: "Enterprise-grade AI-powered smart farming ecosystem connecting Farmers, Buyers, Equipment Owners, and more.",
    siteName: "AGRI-NOVA",
  },
  twitter: {
    card: "summary_large_image",
    title: "AGRI-NOVA | Smart Farming Ecosystem",
    description: "Enterprise-grade AI-powered smart farming ecosystem connecting Farmers, Buyers, Equipment Owners, and more.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(e) {
                fetch('/api/log', { method: 'POST', body: JSON.stringify({ message: e.message, stack: e.error ? e.error.stack : null, url: window.location.href }) }).catch(console.error);
              });
              window.addEventListener('unhandledrejection', function(e) {
                fetch('/api/log', { method: 'POST', body: JSON.stringify({ message: e.reason ? e.reason.message || String(e.reason) : 'Unhandled Rejection', stack: e.reason ? e.reason.stack : null, url: window.location.href }) }).catch(console.error);
              });
            `
          }}
        />
      </head>
      <body className="bg-light-bg text-gray-900 font-sans antialiased selection:bg-gray-200 selection:text-gray-900">
        <AuthRoleProvider>
          <SplashPreloader />
          <CommandPalette />
          {children}
        </AuthRoleProvider>
      </body>
    </html>
  );
}
