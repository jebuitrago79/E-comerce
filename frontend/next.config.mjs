/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["YOUR_SUPABASE_PROJECT_ID.supabase.co"],
  },
};

export default nextConfig;
