/** @type {import('next').NextConfig} */
const nextConfig = {
  // @zoned/core ships TypeScript source rather than a build step, so Next
  // compiles it alongside the app.
  transpilePackages: ['@zoned/core'],
};

export default nextConfig;
