"use client";

import { redirect } from "next/navigation";

import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

export function ChatHistory({ items }: any) {
  const [chatId, setChatId] = useState<string | string[] | null>(null);

  const params = useParams();

  // useEffect(() => {
  //   const id = params.chatId;
  //   if (id) {
  //     setChatId(id);
  //   }
  // }, [params]);

  return (
    <>
      <SidebarGroup className="h-[500px] overflow-aut">
        <SidebarGroupLabel>History chat</SidebarGroupLabel>
        <SidebarGroupContent className="flex flex-col gap-2 ">
          <SidebarMenu>
            {items.map((item: any) => {
              return (
                <SidebarMenuItem key={item.id}>
                  <DropdownMenu>
                    <SidebarMenuButton
                      disabled={false}
                      tooltip={item.title || item.id}
                      className={`cursor-pointer  
                        ${chatId === item.id ? "bg-primary" : ""}
                        hover:bg-primary/80`}
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
    </>
  );
}
