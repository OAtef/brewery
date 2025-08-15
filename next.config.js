/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static generation for pages with authentication
  trailingSlash: false,
  // Disable static optimization for specific pages
  exportPathMap: async function (defaultPathMap) {
    return {
      "/": { page: "/" },
      "/menu": { page: "/menu" },
      // Skip static generation for protected pages
    };
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
