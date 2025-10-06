import { suppliers } from "@/config/suppliers";
import { create } from "zustand";

export type Supplier = {
  id: string;
  name: string;
  taxCode: string;
  bankAccount: string;
  paymentTerm: string;
};

export type Transaction = {
  supplier_name: string;
  tax_code: string;
  invoice_number: string;
  invoice_date: string;
  amount: number;
  vat: number;
  expense_category: string;
  total: number;
};

export type InvoiceState = {
  invoiceUrl: string | null;
  invoiceFileBase64: string;
  invoiceFileName: string;
  suppliers: Supplier[];
  transactions: Transaction[];
  isProcessingTransaction: boolean;
  currentSupplier: Supplier | null;
};

export type InvoiceActions = {
  setInvoiceUrl: (fileUrl: string) => void;
  setCurrentSupplier: (supplierId: string) => void;
  setInvoiceFileBase64: (data: string) => void;
  setInvoiceFileName: (data: string) => void;
  setTransactions: (items: Transaction[]) => void;
  addTransactionItem: (item: Transaction) => void;
  setIsProcessingTransaction: (data: boolean) => void;
};

export type InvoiceStore = InvoiceState & InvoiceActions;

export const useInvoiceStore = create<InvoiceStore>()((set, get) => ({
  invoiceUrl: null,
  invoiceFileBase64: "",
  invoiceFileName: "",
  currentSupplier: null,
  suppliers: suppliers,
  transactions: [],
  isProcessingTransaction: false,
  setInvoiceUrl: (fileUrl: string) => set(() => ({ invoiceUrl: fileUrl })),
  setCurrentSupplier: (supplierId: string) => {
    set(() => ({
      currentSupplier: get().suppliers.find((sup) => sup.id === supplierId),
    }));
  },
  setInvoiceFileBase64: (data: string) => set({ invoiceFileBase64: data }),
  setInvoiceFileName: (data: string) => set({ invoiceFileName: data }),
  setTransactions: (items: Transaction[]) =>
    set(() => ({ transactions: items })),
  addTransactionItem: (item: Transaction) =>
    set((state) => ({ transactions: [...state.transactions, item] })),
  setIsProcessingTransaction: (data: boolean) =>
    set(() => ({ isProcessingTransaction: data })),
}));
