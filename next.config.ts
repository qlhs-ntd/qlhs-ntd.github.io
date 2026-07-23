import type { NextConfig } from "next";

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || "";
const normalizedBasePath = rawBasePath
  ? `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`
  : "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  allowedDevOrigins: ["192.168.2.26"],
  compiler: {
    styledComponents: true,
  },
  images: {
    unoptimized: true,
  },
  basePath: normalizedBasePath,
  assetPrefix: normalizedBasePath || undefined,
};

export default nextConfig;
