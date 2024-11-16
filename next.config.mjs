/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        pathname: '/coins/images/**',
      },
    ],
    unoptimized: true, // For static exports or when not using Next.js image optimization server
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
  },
  output: 'standalone', // Creates a standalone build that's easier to deploy
}

export default nextConfig
