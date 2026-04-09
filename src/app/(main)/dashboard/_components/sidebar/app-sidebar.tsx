"use client";

import Link from "next/link";

import {
  CircleHelp,
  ClipboardList,
  Command,
  Database,
  File,
  Search,
  Settings,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useShallow } from "zustand/react/shallow";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems } from "@/navigation/sidebar/sidebar-items";
import { usePreferencesStore } from "@/stores/preferences/preferences-provider";

import { NavMain } from "./nav-main";
import { ChatHistory } from "./chat-history";
import { NavUser } from "./nav-user";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const _data = {
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: CircleHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: Database,
    },
    {
      name: "Reports",
      url: "#",
      icon: ClipboardList,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: File,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const params = useParams();
  const [chatId, setChatId] = useState<string | string[] | null>(null);

  const rootUser = {
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    avatar: session?.user?.image ?? "",
  };

  const { sidebarVariant, sidebarCollapsible, isSynced } = usePreferencesStore(
    useShallow((s) => ({
      sidebarVariant: s.sidebarVariant,
      sidebarCollapsible: s.sidebarCollapsible,
      isSynced: s.isSynced,
    })),
  );

  useEffect(() => {
    const id = params.chatId;
    if (id) {
      setChatId(id);
    }
    getHistoryChat();
  }, [params]);

  const variant = isSynced ? sidebarVariant : props.variant;
  const collapsible = isSynced ? sidebarCollapsible : props.collapsible;

  const getHistoryChat = async () => {
    console.log("getHistoryChat");
    const res = await fetch("/api/chats?limit=10", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const { chats } = await res.json();
    setChats(chats);
  };

  return (
    <Sidebar {...props} variant={variant} collapsible={collapsible}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link prefetch={false} href="/dashboard/default">
                <Command />
                <span className="font-semibold text-base">
                  {APP_CONFIG.name}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarItems} />
        <ChatHistory items={chats} />
        {/* <NavDocuments items={data.documents} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* <SidebarSupportCard /> */}
        <NavUser user={rootUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
