"use client";
import Assistant from "@/components/assistant";
import useConversationStore from "@/stores/useConversationStore";
import useToolsStore from "@/stores/useToolsStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Main() {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);
  const router = useRouter();
  const { resetConversation } = useConversationStore();
  const { setVectorStore } = useToolsStore();

  const initialVectorStore = {
    id: `${process.env.NEXT_PUBLIC_OPENAI_VECTOR_STORE_ID}`,
    name: "Example",
  };

  // After OAuth redirect, reinitialize the conversation so the next turn
  // uses the connector-enabled server configuration immediately
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isConnected = new URLSearchParams(window.location.search).get(
      "connected"
    );
    if (isConnected === "1") {
      resetConversation();
      router.replace("/", { scroll: false });
    }
  }, [router, resetConversation]);

  // Initialize a vector store
  useEffect(() => {
    setVectorStore(initialVectorStore);
  }, []);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 h-2/3 ">
        <div className="bg-muted/50  flex-1 h-2/3 rounded-xl ">
          <Assistant />
        </div>
      </div>
    </>
  );
}
