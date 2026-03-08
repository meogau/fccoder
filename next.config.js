/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.ap-southeast-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'fc-coder.s3.ap-southeast-1.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig