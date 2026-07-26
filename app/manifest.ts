import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hồ Sơ Việt",
    short_name: "Hồ Sơ",
    description: "Quản lý, cập nhật và đồng bộ hồ sơ với Google Sheets.",
    start_url: "./",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#f6f7fb",
    icons: [
      {
        src: "./icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "./icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
