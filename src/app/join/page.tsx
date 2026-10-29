import { redirect } from "next/navigation";

/**
 * The link a society admin shares: /join?code=KKX001. Sends the person to the resident sign-in; the society is
 * found from the code there, so they land straight on "Find your society" with theirs selected.
 */
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const clean = (code ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
  redirect(clean ? `/login/resident?code=${clean}` : "/login/resident");
}
