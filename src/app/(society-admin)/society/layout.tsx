import { AppShell } from "@/components/layout/AppShell";
import { SocietySidebar } from "@/components/layout/SocietySidebar";

export default function SocietyAdminLayout({ children }: LayoutProps<"/society">) {
  return <AppShell sidebar={<SocietySidebar />}>{children}</AppShell>;
}
