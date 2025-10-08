/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA configuration
  env: {
    CUSTOM_KEY: 'my-value',
  },
  // Enable static optimization
  trailingSlash: false,
  // Add PWA manifest
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig