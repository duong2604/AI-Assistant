"use client";

import { DropZoneUploader } from "@/components/DropZoneUploader";
import { SupplierSelector } from "@/components/supplier-selector";
import { Button } from "@/components/ui/button";
import { useInvoiceStore } from "@/stores/useInvoiceStore";

export default function Accountant() {
  const { invoiceUrl } = useInvoiceStore((state) => state);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-6">Invoice Approval</h1>
      <div className="mb-2 mt-10 flex justify-between items-center">
        <h3 className="font-medium">Upload a bill to check</h3>
        {invoiceUrl ? (
          <div className="flex items-center gap-2">
            <Button>Reset</Button>
            <Button>Preview</Button>
          </div>
        ) : (
          <></>
        )}
      </div>
      <DropZoneUploader />

      <div className="mt-5 flex gap-2 items-center">
        <h3 className="font-medium">Your Provider: </h3>
        <SupplierSelector />
      </div>
    </main>
  );
}
