"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  onSuccess?: () => void;
}

export function CostTrackingUploadButton({ onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("loading");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cost-tracking", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Import failed");
      } else {
        setStatus("success");
        setMessage(`Imported ${data.activities} activities for ${data.projectCode}`);
        onSuccess?.();
      }
    } catch {
      setStatus("error");
      setMessage("Network error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      <Button variant="outline" disabled={status === "loading"} onClick={() => inputRef.current?.click()}>
        {status === "loading" ? "Importing..." : "Import Project CSV"}
      </Button>
      {message && (
        <span className={`text-sm ${status === "success" ? "text-green-600" : "text-destructive"}`}>{message}</span>
      )}
    </div>
  );
}
