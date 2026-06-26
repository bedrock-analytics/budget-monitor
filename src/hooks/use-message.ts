import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Message = {
  id: string;
  chatId: string | null;
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  metadata: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchMessages(_params: { chatId: string }) {
  const qc = useQueryClient();
  // const res = await fetch(`/api/chats/${params.chatId}/messages`, {
  //   method: "GET",
  //   headers: { "Content-Type": "application/json" },
  // });

  // if (!res.ok) throw new Error("Failed to fetch messages");
  // const data = await res.json();
  // return data.messages;

  return useMutation({
    mutationFn: async (chatId: string) => {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "GET",
        body: JSON.stringify({ name }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useMessage(chatId: string | null) {
  return useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => fetchMessages({ chatId: chatId! }),
    enabled: !!chatId,
  });
}
