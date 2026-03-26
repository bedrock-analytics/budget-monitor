import { useQuery } from "@tanstack/react-query";

export type Chat = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
};

async function fetchChats(): Promise<Chat[]> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch chats");
  const data = await res.json();
  return data.chats;
}

export function useChat() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: fetchChats,
  });
}
