"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function ChatSection(prop: { chatId: string }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const SUGGESTIONS = [
    "ISO",
    "Budget 2026",
    // "Explain quantum computing",
    // "Give me a recipe idea",
  ];

  useEffect(() => {
    setChatId(prop.chatId);
    if (!prop.chatId) {
      createChat();
    } else {
      getMessages(prop.chatId);
    }
  // ponytail: createChat/getMessages omitted from deps — they're re-created every render; prop.chatId is the real trigger
  }, [prop.chatId]);

  const getMessages = async (chatId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.messages.length) {
        setMessages(data.messages);
      }
      setIsLoading(false);
    } catch (_error) {
      setIsLoading(false);
    }
  };

  const createChat = async () => {
    try {
      setIsLoading(true);

      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ chatId: id }),
      });
      const data = await res.json();
      router.push(`/chat/${data.chat.id}`);
    } catch (_error) {
      setIsLoading(false);
    }
  };

  const sendMessage = async (
    content: string,
    // nextMessages: Array<{
    //   role: "system" | "user" | "assistant";
    //   content: string;
    // }>,
  ) => {
    const res = await fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", message: content }),
    });
    await saveMessage(content, "user");

    const response = (await res.json()) as {
      reply?: string;
      error?: string;
      success?: boolean;
    };

    if (response.reply) {
      await saveMessage(response?.reply, "assistant");
    }
    return response;
  };

  const saveMessage = async (content: string, role: "system" | "user" | "assistant") => {
    const res = await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: role, message: content }),
    });
    return await res.json();
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
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <p className="text-muted-foreground text-sm">Ask me anything, {session?.user?.name ?? ""}. ?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full border bg-muted px-4 py-2 text-sm hover:bg-accent"
                  onClick={() => {
                    setInput(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

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

      {isLoading ? <div className="text text-sm">Loading...</div> : null}
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
