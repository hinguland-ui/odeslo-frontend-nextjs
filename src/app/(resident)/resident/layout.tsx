import { AppShell } from "@/components/layout/AppShell";
import { ResidentSidebar } from "@/components/layout/ResidentSidebar";
import { ResidentGate } from "@/components/resident/ResidentGate";

export default function ResidentLayout({ children }: LayoutProps<"/resident">) {
  return (
    <AppShell sidebar={<ResidentSidebar />}>
      <ResidentGate>{children}</ResidentGate>
    </AppShell>
  );
}
