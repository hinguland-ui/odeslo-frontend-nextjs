import { NextResponse, type NextRequest } from "next/server";

/**
 * The browser talks only to this same-origin route (/api/proxy/...), never to the backend directly.
 *
 * - The login token lives in an HttpOnly cookie. JavaScript on the page (and any script an attacker might inject)
 *   cannot read it, and the backend's address and the token are not in any request the page makes.
 * - When the backend answers a login with an access_token, it is moved into that cookie and removed from the
 *   response the page receives.
 * - The token is added to the request here, on the server, so the page never handles it.
 */
const BACKEND = (process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const SESSION = "odeslo_session";
const ROLE = "odeslo_role";
const MAX_AGE = 60 * 60 * 24 * 30;
const secure = process.env.NODE_ENV === "production";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ path: string[] }> };

function json(status: number, detail: string) {
  return NextResponse.json({ detail }, { status, headers: { "Cache-Control": "no-store" } });
}

async function forward(req: NextRequest, ctx: Ctx): Promise<Response> {
  // a state-changing request must come from this site itself (belt and braces next to SameSite cookies)
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const origin = req.headers.get("origin");
    if (origin && new URL(origin).host !== req.headers.get("host")) return json(403, "Cross-site request refused");
  }

  const { path } = await ctx.params;
  const target = `${BACKEND}/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const name of ["content-type", "accept", "accept-language", "user-agent", "x-forwarded-for"]) {
    const v = req.headers.get(name);
    if (v) headers.set(name, v);
  }
  // a registration token (new mobile number, not logged in yet) is sent by the page itself; otherwise the cookie is used
  const own = req.headers.get("authorization");
  const session = req.cookies.get(SESSION)?.value;
  if (own) headers.set("authorization", own);
  else if (session) headers.set("authorization", `Bearer ${session}`);

  const hasBody = !["GET", "HEAD"].includes(req.method);
  let res: Response;
  try {
    res = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      // @ts-expect-error `duplex` is required to stream a request body (uploads) and is missing from the DOM typings
      duplex: hasBody ? "half" : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return json(502, "Cannot reach the server. Please try again in a moment.");
  }

  const type = res.headers.get("content-type") ?? "";
  const loggedOut = path.join("/") === "auth/logout" && res.ok;

  // a login answer: keep the token on the server side, hand the page a plain "session started"
  if (res.ok && type.includes("application/json")) {
    const text = await res.text();
    if (text.includes('"access_token"')) {
      try {
        const body = JSON.parse(text) as { access_token?: string | null; user_type?: string | null } & Record<string, unknown>;
        if (typeof body.access_token === "string" && body.access_token) {
          const out = NextResponse.json({ ...body, access_token: null, session: true }, { status: res.status, headers: { "Cache-Control": "no-store" } });
          out.cookies.set(SESSION, body.access_token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: MAX_AGE });
          // the role only decides which panel the page shows; the backend checks every request on its own
          if (body.user_type) out.cookies.set(ROLE, body.user_type, { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: MAX_AGE });
          return out;
        }
      } catch {
        /* not JSON after all: pass it on as it is */
      }
    }
    return new Response(text, { status: res.status, headers: { "Content-Type": type, "Cache-Control": "no-store" } });
  }

  const out = new Response(res.body, { status: res.status });
  for (const name of ["content-type", "content-disposition", "content-length", "content-language"]) {
    const v = res.headers.get(name);
    if (v) out.headers.set(name, v);
  }
  out.headers.set("Cache-Control", "no-store");
  out.headers.set("X-Content-Type-Options", "nosniff");
  if (loggedOut) {
    out.headers.append("Set-Cookie", `${SESSION}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`);
    out.headers.append("Set-Cookie", `${ROLE}=; Path=/; Max-Age=0; SameSite=Lax${secure ? "; Secure" : ""}`);
  }
  return out;
}

export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
