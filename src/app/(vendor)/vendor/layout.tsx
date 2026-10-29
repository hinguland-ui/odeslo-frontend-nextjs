import { AppShell } from "@/components/layout/AppShell";
import { VendorSidebar } from "@/components/layout/VendorSidebar";

export default function VendorLayout({ children }: LayoutProps<"/vendor">) {
  return <AppShell sidebar={<VendorSidebar />}>{children}</AppShell>;
}
