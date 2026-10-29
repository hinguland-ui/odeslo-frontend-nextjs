import { AppShell } from "@/components/layout/AppShell";
import { SuperSidebar } from "@/components/layout/SuperSidebar";

export default function SuperAdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell sidebar={<SuperSidebar />} dark>
      {children}
    </AppShell>
  );
}
