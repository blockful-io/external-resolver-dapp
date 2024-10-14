/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["euc.li", "i.imgur.com", "ipfs.io"],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
