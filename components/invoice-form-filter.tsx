"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InvoiceStore, useInvoiceStore } from "@/stores/useInvoiceStore";
import { useEffect } from "react";
import { Spinner } from "./ui/spinner";

const formSchema = z.object({
  supplier_name: z.string(),
  tax_code: z.string(),
  invoice_number: z.string(),
  invoice_date: z.string(),
  amount: z.number().min(0),
  vat: z.number().min(0),
  expense_category: z.string(),
  total: z.number().min(0),
});

export const handleEventMessage = async ({ event, data }: any) => {
  const { setValidationResult, setIsProcessingValidation } =
    useInvoiceStore.getState() as InvoiceStore;
  if (event === "response.output_text.delta") {
    setIsProcessingValidation(true);
  } else if (event === "response.completed") {
    const { response } = data;
    const raw = response?.output[0]?.content[0]?.text;
    const result = JSON.parse(raw);
    setIsProcessingValidation(false);

    console.log("result", result);
    setValidationResult(result);
  }
};

export default function InvoiceFormFilter() {
  const { transactions, currentSupplier, isProcessingValidation } =
    useInvoiceStore((state) => state);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const invoiceExtract = { ...values };
    const response = await fetch("/api/validate_invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplier: currentSupplier,
        invoiceExtract,
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
  }

  useEffect(() => {
    if (transactions && transactions.length) {
      form.reset(transactions[0]);
    }
  }, [transactions.length]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 mt-5 "
        >
          <div className="grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="supplier_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier</FormLabel>
                  <FormControl>
                    <Input {...form.register("supplier_name")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tax_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax code</FormLabel>
                  <FormControl>
                    <Input {...form.register("tax_code")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Number</FormLabel>
                  <FormControl>
                    <Input {...form.register("invoice_number")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invoice_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Date</FormLabel>
                  <FormControl>
                    <Input {...form.register("invoice_date")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register("amount", { valueAsNumber: true })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT</FormLabel>
                  <FormControl>
                    <Input {...form.register("vat", { valueAsNumber: true })} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expense_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Category</FormLabel>
                  <FormControl>
                    <Input {...form.register("expense_category")} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total</FormLabel>
                  <FormControl>
                    <Input
                      {...form.register("total", { valueAsNumber: true })}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isProcessingValidation} type="submit">
            {isProcessingValidation ? <Spinner /> : "Validate"}
          </Button>
        </form>
      </Form>
    </>
  );
}
