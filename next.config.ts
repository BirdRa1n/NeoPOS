import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  
  async rewrites() {
    return [
      {
        source: "/api/functions/:path*",
        destination: "https://moinedjbjuioncemqomf.supabase.co/functions/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
