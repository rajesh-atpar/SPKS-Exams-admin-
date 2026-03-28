/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  // Keep dev and production artifacts separate so a running dev server
  // does not break after a production build writes a different chunk layout.
  distDir: isDev ? ".next-dev" : ".next",
};

export default nextConfig;
