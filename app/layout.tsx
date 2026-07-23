import type { Metadata } from "next";
import "./globals.scss";
import StyledComponentsRegistry from "./StyledComponentsRegistry";

export function generateMetadata(): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const socialImage = new URL("og.png", `${siteUrl.replace(/\/$/, "")}/`).toString();

  return {
    metadataBase: new URL(siteUrl),
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
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
