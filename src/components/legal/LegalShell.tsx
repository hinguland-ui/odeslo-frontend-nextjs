import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/Brand";

export const CONTACT = {
  email: "info@odeslo.com",
  phone: "+91 99829 25680",
  tel: "+919982925680",
  whatsapp: "https://wa.me/919982925680",
};

/** Public page frame for the legal pages (privacy policy, account deletion): no login needed. */
export function LegalShell({ title, updated, intro, children }: { title: string; updated: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-panel">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" aria-label="Odeslo home"><BrandLogo height={30} /></Link>
          <nav className="flex gap-4 text-sm text-muted">
            <Link href="/privacy-policy" className="hover:text-ink">Privacy</Link>
            <Link href="/delete-account" className="hover:text-ink">Delete account</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-muted">Last updated: {updated}</p>
        {intro && <div className="mt-6 text-[15px] leading-7 text-body">{intro}</div>}
        <div className="mt-8 space-y-8">{children}</div>
        <section className="mt-12 rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-ink">Contact us</h2>
          <ul className="mt-3 space-y-1 text-[15px] text-body">
            <li>Email: <a className="text-violet underline" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
            <li>Phone / WhatsApp: <a className="text-violet underline" href={`tel:${CONTACT.tel}`}>{CONTACT.phone}</a></li>
          </ul>
        </section>
      </main>
      <footer className="border-t border-line py-6 text-center text-sm text-muted">© 2026 Odeslo. All rights reserved.</footer>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-7 text-body">{children}</div>
    </section>
  );
}

export function List({ items }: { items: ReactNode[] }) {
  return <ul className="list-disc space-y-1.5 pl-5">{items.map((it, i) => <li key={i}>{it}</li>)}</ul>;
}
