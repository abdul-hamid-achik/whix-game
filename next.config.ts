import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Allow external images if needed for pixel art
  images: {
    domains: ['localhost'],
    unoptimized: true, // For pixel art to remain crisp
  },
  
  // Webpack configuration for PIXI.js
  webpack: (config) => {
    // Handle canvas for server-side rendering
    if (!config.externals) {
      config.externals = [];
    }
    
    if (Array.isArray(config.externals)) {
      config.externals.push({
        canvas: 'canvas',
      });
    } else {
      config.externals = [
        config.externals,
        {
          canvas: 'canvas',
        }
      ];
    }
    
    return config;
  },
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_GAME_VERSION: process.env.GAME_VERSION || '0.1.0',
  },
};

export default nextConfig;
