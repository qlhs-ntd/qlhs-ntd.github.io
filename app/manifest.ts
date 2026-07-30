import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Dũng - QLHS",
    short_name: "Dũng - QLHS",
    description: "QLHS",
    start_url: "./",
    display: "standalone",
    background_color: "#f6f7fb",
    theme_color: "#f6f7fb",
    icons: [
      {
        src: "./icon-192.png?v=2",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "./icon-512.png?v=2",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
