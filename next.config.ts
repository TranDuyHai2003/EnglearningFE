/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Mỗi domain phải là một object riêng biệt trong mảng này
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Domain của Unsplash
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos", // Domain của Picsum Photos (dùng trong file seed.txt)
        port: "",
        pathname: "/**",
      },
    ],
  },
};

// Nếu file của bạn là next.config.js, dùng dòng này:
module.exports = nextConfig;

// Nếu file của bạn là next.config.mjs, dùng dòng này:
// export default nextConfig;
