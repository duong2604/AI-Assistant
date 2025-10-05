import { suppliers } from "@/config/suppliers";
import { create } from "zustand";

type Supplier = {
  id: string;
  name: string;
  taxCode: string;
  bankAccount: string;
  paymentTerm: string;
};

type InvoiceState = {
  invoiceUrl: string | null;
  suppliers: Supplier[];
  currentSupplier: Supplier | null;
};

type InvoiceActions = {
  setInvoiceUrl: (fileUrl: string) => void;
  setCurrentSupplier: (supplierId: string) => void;
};

type InvoiceStore = InvoiceState & InvoiceActions;

export const useInvoiceStore = create<InvoiceStore>()((set, get) => ({
  invoiceUrl: null,
  suppliers: suppliers,
  currentSupplier: null,
  setInvoiceUrl: (fileUrl: string) => set(() => ({ invoiceUrl: fileUrl })),
  setCurrentSupplier: (supplierId: string) => {
    set(() => ({
      currentSupplier: get().suppliers.find((sup) => sup.id === supplierId),
    }));
  },
}));
