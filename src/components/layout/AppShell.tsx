import clsx from "clsx";
import type { ReactNode } from "react";

/** 272px sidebar + main content (28px side padding, 24px top) as in the 1280px Figma frames. */
export function AppShell({ sidebar, dark, children }: { sidebar: ReactNode; dark?: boolean; children: ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-[1180px]">
      <aside
        className={clsx(
          "sticky top-0 flex h-screen w-[272px] shrink-0 flex-col overflow-hidden px-5 pb-5 pt-6",
          dark ? "deep bg-ink" : "bg-panel",
        )}
      >
        {sidebar}
      </aside>
      <main className="min-w-0 flex-1 bg-white px-7 pb-7 pt-6">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
