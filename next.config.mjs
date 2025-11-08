/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_API_SERVER: process.env.NEXT_PUBLIC_API_SERVER,
  },
};

export default nextConfig;
