/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Vercel-specific optimizations
  output: 'standalone',
  experimental: {
    // Enable app directory features
    appDir: true,
  },
  // Ensure proper routing
  trailingSlash: false,
  // Handle dynamic routes properly
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
}

export default nextConfig
