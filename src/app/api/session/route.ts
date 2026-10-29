import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const secure = process.env.NODE_ENV === "production";

/** Sign out of this browser: the HttpOnly cookie can only be removed by the server. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  res.cookies.set("odeslo_session", "", { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 0 });
  res.cookies.set("odeslo_role", "", { httpOnly: false, secure, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
