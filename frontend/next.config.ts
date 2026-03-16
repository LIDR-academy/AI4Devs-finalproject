import type { NextConfig } from "next";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://backend:5000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
