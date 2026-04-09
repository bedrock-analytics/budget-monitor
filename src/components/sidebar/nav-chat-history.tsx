"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MessageSquare } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useChat } from "@/hooks/use-chat";

export function NavChatHistory() {
  const pathname = usePathname();
  const { data: chats, isLoading } = useChat();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>History chat</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {isLoading ? (
            <>
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
              <SidebarMenuSkeleton />
            </>
          ) : !chats?.length ? (
            <p className="px-2 py-1 text-muted-foreground text-xs">No chats yet</p>
          ) : (
            chats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/chat/${chat.id}`}
                  tooltip={chat.title ?? "Untitled"}
                >
                  <Link prefetch={false} href={`/chat/${chat.id}`}>
                    <MessageSquare />
                    <span className="truncate">{chat.title ?? "Untitled"}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
