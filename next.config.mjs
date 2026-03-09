/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/linkedin',
        destination: 'https://www.linkedin.com/company/crowdcount/',
        permanent: true,
      },
      {
        source: '/beta-app',
        destination: 'https://testflight.apple.com/join/8oSuJw1M',
        permanent: true,
      },
      {
        source: '/app',
        destination: 'https://apps.apple.com/us/app/crowdcount-app/id6523433094',
        permanent: true,
      },
      {
        source: '/preorder',
        destination: 'https://buy.stripe.com/cNi00ldw0fnUgc31jL8N202',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
