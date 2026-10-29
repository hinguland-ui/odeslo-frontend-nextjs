import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// The backend's public address: only the live-updates socket connects to it from the browser.
const backend = new URL(process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1");
const backendWs = `${backend.protocol === "https:" ? "wss" : "ws"}://${backend.host}`;

/**
 * What the pages may load and talk to. Everything else is refused by the browser, so an injected script cannot
 * send data to another site or load code from one.
 * Next.js needs inline scripts for itself, hence 'unsafe-inline' for scripts (and 'unsafe-eval' only while developing).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.openfreemap.org https://*.basemaps.cartocdn.com https://*.razorpay.com",
  [
    "connect-src 'self'",
    backendWs,
    "https://tiles.openfreemap.org https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com",
    "https://nominatim.openstreetmap.org https://ifsc.razorpay.com https://api.postalpincode.in https://*.razorpay.com",
    isDev ? "ws://localhost:* http://localhost:*" : "",
  ].filter(Boolean).join(" "),
  "worker-src 'self' blob:",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false, // do not announce "Next.js" to every visitor
  productionBrowserSourceMaps: false, // the readable source of the app is not shipped to browsers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
