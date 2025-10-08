"use client";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

import { Progress } from "@/components/ui/progress";
import { storage } from "@/lib/firebase";
import { useInvoiceStore } from "@/stores/useInvoiceStore";
import useToolsStore from "@/stores/useToolsStore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";

export function DropZoneUploader() {
  const { vectorStore } = useToolsStore();
  const {
    invoiceUrl,
    setInvoiceUrl,
    setInvoiceFileBase64,
    setInvoiceFileName,
  } = useInvoiceStore();

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const handleDrop = async (files: File[]) => {
    console.log(files);
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);

    const arrayBuffer = await file.arrayBuffer();

    const base64Content = arrayBufferToBase64(arrayBuffer);
    setInvoiceFileBase64(base64Content);
    setInvoiceFileName(file.name);

    const fileObject = {
      name: file.name,
      content: base64Content,
    };

    const uploadResponse = await fetch("/api/vector_stores/upload_file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileObject,
      }),
    }).catch((e) => {
      throw new Error("Error uploading file");
    });

    // Check log to make sure the file was uploaded successfully!
    const uploadData = await uploadResponse.json();
    const fileId = uploadData.id;
    if (!fileId) {
      throw new Error("Error getting file ID");
    }
    console.log("Uploaded file:", uploadData);

    // 2. Add file to vector store
    const addFileResponse = await fetch("/api/vector_stores/add_file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId,
        vectorStoreId: vectorStore.id,
      }),
    });
    // if (!addFileResponse.ok) {
    //   throw new Error("Error adding file to vector store");
    // }

    // TODO Preview file upload
    // Save file to Firebase Storage
    const fileRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (error) => {
        console.error(error);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setInvoiceUrl(url as any);

        setUploading(false);
      }
    );
  };

  return (
    <Dropzone
      disabled={!!invoiceUrl}
      multiple={false}
      //   accept={{ "files: pdf, docx": [".pdf", ".docx", ".jpeg", ".jpg"] }}
      onDrop={handleDrop}
      onError={console.error}
      className="border-dashed border-2 h-28"
    >
      {uploading ? (
        <div className="w-full min-h-full">
          <Progress value={progress} className="mt-2" />
          <p className="text-sm mt-1 text-muted-foreground">
            Uploading: {progress.toFixed(0)}%
          </p>
        </div>
      ) : (
        <>
          <DropzoneEmptyState />
          <DropzoneContent />
        </>
      )}
    </Dropzone>
  );
}
