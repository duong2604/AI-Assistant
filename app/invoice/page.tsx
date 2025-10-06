"use client";

import { DataTable } from "@/components/data-table";
import { DropZoneUploader } from "@/components/DropZoneUploader";
import InvoiceFormFilter from "@/components/invoice-form-filter";
import { SupplierSelector } from "@/components/supplier-selector";
import { Button } from "@/components/ui/button";
import { invoiceColumns } from "@/lib/tables/invoices";
import { handleEventMessage } from "@/lib/transaction";
import { useInvoiceStore } from "@/stores/useInvoiceStore";

export default function Invoice() {
  const { invoiceUrl, currentSupplier, invoiceFileName, invoiceFileBase64 } =
    useInvoiceStore((state) => state);

  const data = currentSupplier ? [currentSupplier] : [];

  const handleProcess = async () => {
    const response = await fetch("/api/read_invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoiceFileName,
        invoiceFileBase64,
      }),
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return;
    }

    // Reader for streaming data;
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      buffer += chunkValue;

      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          if (dataStr === "[DONE]") {
            done = true;
            break;
          }
          const data = JSON.parse(dataStr);
          handleEventMessage(data);
        }
      }
    }
  };

  return (
    <main className="p-10 flex w-full h-full grow-1 shrink-1 gap-5">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Invoice Approval</h1>
        <div className="mb-2 mt-10 flex justify-between items-center">
          <h3 className="font-medium">Upload a bill to check</h3>
          <div className="flex items-center gap-2">
            <Button disabled={!invoiceUrl}>Reset</Button>
            <Button disabled={!invoiceUrl}>Preview</Button>
            <Button onClick={handleProcess}>Process checking</Button>
          </div>
        </div>
        <DropZoneUploader />

        <div className="mt-5 flex gap-2 items-center">
          <h3 className="font-medium">Your Provider: </h3>
          <SupplierSelector />
        </div>
        {data && data.length && currentSupplier ? (
          <div className="mt-10">
            <DataTable data={[currentSupplier]} columns={invoiceColumns} />
          </div>
        ) : (
          <></>
        )}
      </div>
      <div className="flex-1 border-2 border-dashed px-10 py-5">
        <h3 className="font-medium text-xl">Data Extraction</h3>
        <InvoiceFormFilter />
      </div>
    </main>
  );
}
