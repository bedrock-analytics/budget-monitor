"use client";

import { useState } from "react";

import { redirect, useParams } from "next/navigation";

import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function ChatHistory({ items }: any) {
  const [chatId, _setChatId] = useState<string | string[] | null>(null);

  const _params = useParams();

  // useEffect(() => {
  //   const id = params.chatId;
  //   if (id) {
  //     setChatId(id);
  //   }
  // }, [params]);

  return (
    <SidebarGroup className="overflow-aut h-[500px]">
      <SidebarGroupLabel>History chat</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item: any) => {
            return (
              <SidebarMenuItem key={item.id}>
                <DropdownMenu>
                  <SidebarMenuButton
                    disabled={false}
                    tooltip={item.title || item.id}
                    className={`cursor-pointer ${chatId === item.id ? "bg-primary" : ""}hover:bg-primary/80`}
                    onClick={() => redirect(`/chat/${item.id}`)}
                  >
                    <span>{item.title || item.id}</span>
                  </SidebarMenuButton>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
