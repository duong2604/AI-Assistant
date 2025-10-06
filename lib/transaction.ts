import { InvoiceStore, useInvoiceStore } from "@/stores/useInvoiceStore";

export const handleEventMessage = async ({ event, data }: any) => {
  const { addTransactionItem, setIsProcessingTransaction } =
    useInvoiceStore.getState() as InvoiceStore;
  if (event === "response.output_text.delta") {
    setIsProcessingTransaction(true);
  } else if (event === "response.completed") {
    const { response } = data;
    const raw = response?.output[0]?.content[0]?.text;
    const result = JSON.parse(raw);
    setIsProcessingTransaction(false);
    addTransactionItem(result);
  }
};
