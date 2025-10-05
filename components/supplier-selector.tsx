"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInvoiceStore } from "@/stores/useInvoiceStore";

export function SupplierSelector() {
  const { suppliers, setCurrentSupplier } = useInvoiceStore();

  const handleChange = (value: string) => {
    setCurrentSupplier(value);
  };

  return (
    <Select onValueChange={(value) => handleChange(value)}>
      <SelectTrigger className="w-1/3">
        <SelectValue placeholder="Choose a provider" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {suppliers.map((sup) => (
            <SelectItem key={sup.id} value={sup.id}>
              {sup.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
