import type { Metadata, Viewport } from "next";
import "./globals.scss";
import StyledComponentsRegistry from "./StyledComponentsRegistry";
import { AuthGate } from "./components/AuthGate";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f7fb",
  colorScheme: "light",
};

export function generateMetadata(): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const socialImage = new URL("logo.png?v=2", `${siteUrl.replace(/\/$/, "")}/`).toString();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "Dũng - QLHS",
      template: "%s | QLHS",
    },
    description: "QLHS",
    applicationName: "QLHS",
    manifest: "/manifest.webmanifest",
    keywords: ["qlhs", "hs"],
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
        { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
        { url: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon-32.png?v=2",
      apple: [
        { url: "/apple-touch-icon.png?v=2", sizes: "180x180", type: "image/png" },
        { url: "/apple-touch-icon-167.png?v=2", sizes: "167x167", type: "image/png" },
        { url: "/apple-touch-icon-152.png?v=2", sizes: "152x152", type: "image/png" },
      ],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Dũng - QLHS",
    },
    openGraph: {
      title: "Dũng - QLHS",
      description: "QLHS",
      url: "/",
      siteName: "Dũng - QLHS",
      locale: "vi_VN",
      type: "website",
      images: [{ url: socialImage, width: 1024, height: 1024, alt: "Dũng - QLHS" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Dũng - QLHS",
      description: "QLHS",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <StyledComponentsRegistry><AuthGate>{children}</AuthGate></StyledComponentsRegistry>
      </body>
    </html>
  );
}
