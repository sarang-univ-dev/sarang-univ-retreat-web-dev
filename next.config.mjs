/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SERVER_URL:
      process.env.NEXT_PUBLIC_SERVER_URL || "https://dev.api.sarang-univ.com"
  },
  async rewrites() {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "https://dev.api.sarang-univ.com";
    return [
      {
        source: "/api/:path*",
        destination: serverUrl + "/api/:path*"
      }
    ];
  }
};

export default nextConfig;
