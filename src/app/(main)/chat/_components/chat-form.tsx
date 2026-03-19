"use client";

import { useMemo, useState } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (
    content: string,
    // nextMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  ) => {
    console.log("content ", content);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content }),
    });
    return (await res.json()) as { reply?: string; error?: string; success?: boolean };
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || isSending) return;

    setError(null);
    setIsSending(true);
    setInput("");

    const optimistic: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(optimistic);

    try {
      // const response = await sendMessage([
      //   { role: "system", content: "You are a helpful assistant." },
      //   ...optimistic.map((m) => ({ role: m.role, content: m.content })),
      // ]);

      const response = await sendMessage(content);

      if (!response.reply) {
        throw new Error(response.error || "No reply from server");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: response.reply ?? "" }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send message";
      setError(msg);
    } finally {
      setIsSending(false);
    }
  };

  const canSend = useMemo(() => input.trim().length > 0 && !isSending, [input, isSending]);

  return (
    <div className="@container/main flex h-[calc(100dvh-10rem)] flex-col gap-4 md:gap-6">
      <div className="flex-1 space-y-3 overflow-auto rounded-xl border bg-background p-4">
        {messages.length === 0 ? <div className="text-muted-foreground text-sm">Ask me anything.</div> : null}

        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {error ? <div className="text-destructive text-sm">{error}</div> : null}

      <div className="flex gap-2">
        <input
          className="h-10 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isSending ? "Thinking..." : "Message..."}
          disabled={isSending}
        />
        <button
          type="button"
          className="h-10 rounded-md bg-primary px-4 text-primary-foreground text-sm disabled:opacity-50"
          onClick={handleSend}
          disabled={!canSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
