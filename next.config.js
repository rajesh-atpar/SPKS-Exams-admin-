/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://spks-exams-backend.vercel.app"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api-docs$/i, "");

const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: API_URL,
  },
  // Keep dev and production artifacts separate so a running `next dev`
  // does not break after a production build writes a different chunk layout.
  distDir: isDev ? ".next-dev" : ".next",
};

export default nextConfig;
