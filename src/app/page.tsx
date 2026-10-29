import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

// src/proxy.ts sends signed-in users to their own dashboard before this renders, so this is the visitor landing page.
export const metadata: Metadata = {
  title: { absolute: "Odeslo · The society platform that gets work done" },
  description: "Residents, vendors and society admins in one place: group deals, live job tracking, chat, secure files and online payments.",
};

export default function Home() {
  return <Landing />;
}
