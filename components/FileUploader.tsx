"use client";

import { useEffect, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

export default function FileUploader() {
  const [progress, setProgress] = useState(0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const fileRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(fileRef, file);
    setUploading(true);

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
        setFileUrl(url as any);
        setUploading(false);
      }
    );
  };

  return (
    <Card className="max-w-md mx-auto mt-10 p-4">
      <CardContent className="space-y-4">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => handleUpload(e)}
          className="cursor-pointer"
        />

        {uploading && (
          <div>
            <Progress value={progress} className="mt-2" />
            <p className="text-sm mt-1 text-muted-foreground">
              Uploading: {progress.toFixed(0)}%
            </p>
          </div>
        )}

        {fileUrl && (
          <iframe
            src={fileUrl}
            className="w-full h-[400px] border rounded-lg"
            title="PDF preview"
          />
        )}

        {fileUrl && (
          <Button asChild className="w-full" variant="outline">
            <a
              href={`https://docs.google.com/gview?url=${encodeURIComponent(
                fileUrl
              )}&embedded=true`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View DOCX
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
