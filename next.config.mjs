/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // 빌드 시 ESLint 체크 건너뛰기 (선택사항)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입 에러가 있어도 빌드 계속 진행 (선택사항, 권장하지 않음)
    ignoreBuildErrors: false,
  },
  env: {
    NEXT_PUBLIC_API_SERVER: process.env.NEXT_PUBLIC_API_SERVER,
  },
};

export default nextConfig;
