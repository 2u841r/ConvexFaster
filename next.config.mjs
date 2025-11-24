import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true,
    reactCompiler: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bevgyjm5apuichhj.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
