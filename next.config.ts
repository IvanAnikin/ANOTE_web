import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimise barrel imports for tree-shaking
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
  // Image optimisation: serve modern formats
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
