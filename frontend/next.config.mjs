/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // this was included because server actions don't do well with blobs
        // we also don't need to worry about authentication with this one
        source: '/api/image_to_tetris',
        destination: process.env.BACKEND_URL + "/api/image_to_tetris",
      },
    ]
  },
};

export default nextConfig;
