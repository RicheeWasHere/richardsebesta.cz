import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        // Allow this standalone widget to be embedded in an iframe from any origin.
        // Do not apply these headers to the rest of the site.
        source: "/bio-widget.html",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
