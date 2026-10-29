import { NextResponse, type NextRequest } from "next/server";

/**
 * Role-based routing. The role cookie is written at login (src/lib/auth/session.ts).
 * - /society/* only for society admins, /admin/* only for super admins, /vendor/* only for vendors (service partners)
 * - logged-in users visiting /login or / go to their own dashboard
 * The backend still checks every request with the JWT; this only keeps each role in its own panel.
 */
const HOME = { society_admin: "/society/dashboard", super_admin: "/admin/dashboard", partner: "/vendor/dashboard", resident: "/resident/home" } as const;
type Role = keyof typeof HOME;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const roleCookie = request.cookies.get("odeslo_role")?.value;
  const hasToken = !!request.cookies.get("odeslo_session")?.value;
  const role: Role | null = hasToken && (roleCookie === "society_admin" || roleCookie === "super_admin" || roleCookie === "partner" || roleCookie === "resident") ? roleCookie : null;

  const redirect = (to: string) => NextResponse.redirect(new URL(to, request.url));

  if (pathname === "/" || pathname === "/login" || pathname.startsWith("/login/")) {
    if (role) return redirect(HOME[role]);
    return NextResponse.next(); // visitors see the landing page at "/" and the sign-in at "/login"
  }

  const needs: Role | null = pathname.startsWith("/society") ? "society_admin" : pathname.startsWith("/admin") ? "super_admin" : pathname.startsWith("/vendor") ? "partner" : pathname.startsWith("/resident") ? "resident" : null;
  if (!needs) return NextResponse.next();

  if (!role) return redirect(`/login?next=${encodeURIComponent(pathname + search)}`);
  if (role !== needs) return redirect(HOME[role]);
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/login/:path*", "/society/:path*", "/admin/:path*", "/vendor/:path*", "/resident/:path*"],
};
