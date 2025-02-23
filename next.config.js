/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Optimize client-side chunks
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 500000,
        cacheGroups: {
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "react",
            chunks: "all",
            priority: 40,
          },
          nextui: {
            test: /[\\/]node_modules[\\/]@nextui-org[\\/]/,
            name: "nextui",
            chunks: "all",
            priority: 30,
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: "supabase",
            chunks: "all",
            priority: 20,
          },
          markdown: {
            test: /[\\/]node_modules[\\/](react-markdown|remark-gfm|remark-math|rehype-katex)[\\/]/,
            name: "markdown",
            chunks: "all",
            priority: 10,
          },
        },
      };
    }
    return config;
  },
  // Enable static exports for Vercel
  output: "export",
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
