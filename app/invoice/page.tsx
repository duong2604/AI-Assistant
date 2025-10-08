"use client";

import { DataTable } from "@/components/data-table";
import { DropZoneUploader } from "@/components/drop-file-upload";
import { FilePreviewDialog } from "@/components/file-preview";
import InvoiceFormFilter from "@/components/invoice-form-filter";
import { SupplierSelector } from "@/components/supplier-selector";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ValidationResultPanel } from "@/components/validation-result";
import { invoiceColumns } from "@/lib/tables/invoices";
import { handleEventMessage } from "@/lib/transaction";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import { useState } from "react";

export default function Invoice() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    invoiceUrl,
    currentSupplier,
    invoiceFileName,
    invoiceFileBase64,
    isProcessingTransaction,
    setIsProcessingTransaction,
  } = useInvoiceStore((state) => state);

  const data = currentSupplier ? [currentSupplier] : [];

  const handleProcess = async () => {
    setIsProcessingTransaction(true);
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
      <FilePreviewDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        invoiceUrl={invoiceUrl}
      />
      <div className="flex-1 flex flex-col gap-2">
        <div>
          <h1 className="text-2xl font-bold mb-6">Invoice Approval</h1>
          <div className="mb-2 mt-10 flex justify-between items-center">
            <h3 className="font-medium hidden md:block">Upload an invoice</h3>
            <div className="flex items-center gap-2">
              <Button disabled={!invoiceUrl}>Reset</Button>
              <Button disabled={!invoiceUrl} onClick={() => setIsOpen(true)}>
                Preview
              </Button>
              <Button
                disabled={!invoiceUrl || isProcessingTransaction}
                onClick={handleProcess}
                className="flex items-center justify-center gap-2"
              >
                {isProcessingTransaction ? (
                  <>
                    <Spinner />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>Extract</>
                )}
              </Button>
            </div>
          </div>
          <DropZoneUploader />

          <div className="mt-5 flex gap-2 items-center">
            <SupplierSelector />
          </div>
          {data && data.length && currentSupplier ? (
            <div className="mt-2">
              <DataTable data={[currentSupplier]} columns={invoiceColumns} />
            </div>
          ) : (
            <div className="mt-2">
              <DataTable data={[]} columns={invoiceColumns} />
            </div>
          )}
        </div>
        <ValidationResultPanel />
      </div>
      <div className="flex-1 border-2 border-dashed px-10 py-5 flex flex-col">
        <div>
          <h3 className="font-medium text-xl">Invoice Extraction</h3>
          <InvoiceFormFilter />
        </div>
        <div className="w-full h-full flex items-end justify-end gap-2">
          <Button>Accept</Button>
          <Button variant={"destructive"}>Decline</Button>
        </div>
      </div>
    </main>
  );
}
