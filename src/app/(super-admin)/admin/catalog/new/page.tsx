"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button, PageHeader } from "@/components/ui";
import { CatalogItemForm } from "@/components/super-admin/catalog/CatalogItemForm";
import { PricingPanel } from "@/components/super-admin/catalog/PricingPanel";
import { useCatalogForm } from "@/components/super-admin/catalog/useCatalogForm";
import { useAction } from "@/hooks/useAction";
import { useLookups } from "@/hooks/useLookups";
import { dealsApi, partnersApi } from "@/lib/api/deals";

export default function AddCatalogItemPage() {
  const router = useRouter();
  const form = useCatalogForm();
  const look = useLookups();
  const partners = useQuery({ queryKey: ["partners"], queryFn: () => partnersApi.list() });

  const save = useAction(
    async (publish: boolean) => {
      const deal = await dealsApi.create(form.payload());
      return publish ? dealsApi.publish(deal.id) : deal;
    },
    {
      success: (d) => (d.status === "published" ? `${d.title} is live` : `${d.title} saved as draft`),
      invalidate: [["catalog"], ["deals"]],
      onSuccess: () => router.push("/admin/catalog"),
    },
  );

  return (
    <>
      <PageHeader
        breadcrumb="Catalog / New item"
        title="Add to catalog,"
        light={form.f.title ? `${form.f.title}.` : "new item."}
        actions={
          <>
            <Button variant="light" disabled={!form.valid} loading={save.isPending && save.variables === false} onClick={() => save.mutate(false)}>Save draft</Button>
            <Button disabled={!form.valid} loading={save.isPending && save.variables === true} onClick={() => save.mutate(true)}>Make active</Button>
          </>
        }
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <CatalogItemForm form={form} partners={partners.data?.items ?? []} societies={look.societies} />
        <PricingPanel form={form} />
      </div>
    </>
  );
}
