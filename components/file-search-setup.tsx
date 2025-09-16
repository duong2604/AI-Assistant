"use client";
import React, { useState } from "react";
import useToolsStore from "@/stores/useToolsStore";
import FileUpload from "@/components/file-upload";
import { Input } from "./ui/input";
import { CircleX } from "lucide-react";
import { TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Tooltip } from "./ui/tooltip";
import { TooltipProvider } from "./ui/tooltip";

export default function FileSearchSetup() {
  const { vectorStore, setVectorStore } = useToolsStore();
  const [newStoreId, setNewStoreId] = useState<string>("");

  const unlinkStore = async () => {
    setVectorStore({
      id: "",
      name: "",
    });
  };

  const handleAddStore = async (storeId: string) => {
    if (storeId.trim()) {
      const newStore = await fetch(
        `/api/vector_stores/retrieve_store?vector_store_id=${storeId}`
      ).then((res) => res.json());
      if (newStore.id) {
        console.log("Retrieved store:", newStore);
        setVectorStore(newStore);
      } else {
        alert("Vector store not found");
      }
    }
  };

  return (
    <div className="flex mt-6 items-center justify-between">
      <div className="text-sm text-zinc-500">Upload a file here.</div>
      <FileUpload
        vectorStoreId={vectorStore?.id}
        vectorStoreName={vectorStore?.name ?? ""}
        onAddStore={(id) => handleAddStore(id)}
        onUnlinkStore={() => unlinkStore()}
      />
    </div>
  );
}
