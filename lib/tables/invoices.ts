import { Supplier, Transaction } from "@/stores/useInvoiceStore";
import { ColumnDef } from "@tanstack/react-table";

export const invoiceColumns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "taxCode",
    header: "Tax Code",
  },
  {
    accessorKey: "bankAccount",
    header: "Bank Account",
  },
  {
    accessorKey: "paymentTerm",
    header: "Payment Term",
  },
];

export const extractedInvoice: ColumnDef<Transaction>[] = [
  {
    accessorKey: "supplier_name",
    header: "Supply Name",
  },
  {
    accessorKey: "tax_code",
    header: "Tax code",
  },
  {
    accessorKey: "invoice_number",
    header: "Invoice",
  },
  {
    accessorKey: "invoice_date",
    header: "Invoice Date",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "expense_category",
    header: "Expense Category",
  },
  {
    accessorKey: "supplier_name",
    header: "Total",
  },
];
