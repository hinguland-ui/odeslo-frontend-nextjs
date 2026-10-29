/**
 * Where the browser sends API calls: this site's own /api/proxy route, which adds the HttpOnly login cookie and
 * forwards to the real backend (BACKEND_URL on the server). The backend address is never in a page request.
 */
export const API_URL = "/api/proxy";

/**
 * The backend's public address. Only used where a URL must be shown or opened from outside the site: the Razorpay
 * webhook address to copy, and the live-updates socket (WebSockets cannot go through the proxy).
 */
export const PUBLIC_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
