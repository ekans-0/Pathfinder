import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { AccessibilityProvider } from "@/components/accessibility-provider"
import "./globals.css"
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pathfinder - Learn Your Rights, Find Your Voice",
  description:
    "An accessible learning platform that empowers individuals with disabilities to understand and advocate for their rights. Developed in partnership with People On the Go Maryland.",
  keywords: ["disability rights", "ADA", "accessibility", "self-advocacy", "education", "learning platform"],
  authors: [{ name: "Pathfinder Team" }],
  openGraph: {
    title: "Pathfinder - Learn Your Rights, Find Your Voice",
    description: "An accessible learning platform for disability rights education",
    type: "website",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="3327ddbb-25c8-4ab3-95d4-e079fd11975f"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <AccessibilityProvider>{children}</AccessibilityProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}