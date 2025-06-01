/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict mode for better development experience
  reactStrictMode: true,
  // Configure webpack if needed
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
