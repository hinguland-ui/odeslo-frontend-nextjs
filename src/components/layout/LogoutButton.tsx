"use client";

import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { LogOut } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { clearSession } from "@/lib/auth/session";

/** Full-width red-tinted button so "Log out" is easy to spot at the bottom of the menu. */
export function LogoutButton({ dark }: { dark?: boolean }) {
  const qc = useQueryClient();
  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* token may already be invalid */
    }
    clearSession();
    qc.clear();
    window.location.href = "/login";
  };
  return (
    <button
      onClick={logout}
      className={clsx(
        "flex h-10 w-full items-center justify-center gap-2 rounded-[14px] text-[13px] font-bold transition",
        dark ? "bg-pink-fg/15 text-[#ff8fa6] hover:bg-pink-fg hover:text-white" : "bg-pink-bg text-pink-fg hover:bg-pink-fg hover:text-white",
      )}
    >
      <LogOut size={16} strokeWidth={2.4} />
      Log out
    </button>
  );
}
