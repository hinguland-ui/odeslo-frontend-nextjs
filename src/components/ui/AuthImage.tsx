"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";

const cache = new Map<string, Promise<string>>();

/** Uploaded files have no public link: fetch with the login token and show from memory (kept for the visit). */
function load(path: string): Promise<string> {
  let p = cache.get(path);
  if (!p) {
    p = fetch(`${API_URL}/files/${path}`).then(async (res) => {
      if (!res.ok) throw new Error(String(res.status));
      return URL.createObjectURL(await res.blob());
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p;
}

export function AuthImage({ path, className, alt = "" }: { path: string; className?: string; alt?: string }) {
  const [url, setUrl] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    load(path).then((u) => alive && setUrl(u)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [path]);
  if (failed) return <div className={clsx("grid place-items-center bg-mist text-[11px] text-muted", className)}>Photo unavailable</div>;
  if (!url) return <div className={clsx("animate-pulse bg-mist", className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} className={className} />;
}
