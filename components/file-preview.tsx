import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dispatch, SetStateAction } from "react";

interface FilePreviewProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  invoiceUrl: string | null;
}

export function FilePreviewDialog({
  isOpen,
  setIsOpen,
  invoiceUrl,
}: FilePreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[666px] min-h-[80%]">
        <DialogHeader>
          <DialogTitle>File Preview</DialogTitle>
        </DialogHeader>
        {invoiceUrl ? (
          <iframe
            src={invoiceUrl}
            className="w-full md:h-[600px] border rounded-lg"
            title="PDF preview"
          />
        ) : (
          <></>
        )}
      </DialogContent>
    </Dialog>
  );
}
