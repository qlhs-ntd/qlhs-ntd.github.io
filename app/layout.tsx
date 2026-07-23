import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.scss";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") || headerStore.get("host") || "localhost:3000";
  const protocol = headerStore.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const socialImage = new URL("/og.png", origin).toString();

  return {
    title: {
      default: "Quản Lý Hồ Sơ",
      template: "%s | Quản Lý Hồ Sơ",
    },
    description: "Quản lý, cập nhật và đồng bộ hồ sơ với Google Sheets.",
    openGraph: {
      title: "Hồ Sơ Việt",
      description: "Quản lý hồ sơ, đơn giản và tập trung.",
      images: [{ url: socialImage, width: 1200, height: 630, alt: "Hồ Sơ Việt" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Hồ Sơ Việt",
      description: "Quản lý hồ sơ, đơn giản và tập trung.",
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
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
