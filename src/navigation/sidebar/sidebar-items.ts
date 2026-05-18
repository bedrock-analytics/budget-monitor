import {
  Banknote,
  Car,
  ClipboardCheck,
  ClipboardList,
  Forklift,
  UserIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
  dynamicChats?: boolean;
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Dashboards",
    items: [
      // {
      //   title: "Default",
      //   url: "/dashboard/default",
      //   icon: LayoutDashboard,
      // },
      // {
      //   title: "CRM",
      //   url: "/dashboard/crm",
      //   icon: ChartBar,
      // },
      // {
      //   title: "Finance",
      //   url: "/dashboard/finance",
      //   icon: Banknote,
      // },
      // {
      //   title: "Analytics",
      //   url: "/dashboard/analytics",
      //   icon: Gauge,
      // },
      // {
      //   title: "E-commerce",
      //   url: "/dashboard/coming-soon",
      //   icon: ShoppingBag,
      //   comingSoon: true,
      // },
      // {
      //   title: "Academy",
      //   url: "/dashboard/coming-soon",
      //   icon: GraduationCap,
      //   comingSoon: true,
      // },
      // {
      //   title: "Logistics",
      //   url: "/dashboard/coming-soon",
      //   icon: Forklift,
      //   comingSoon: true,
      // },
      // {
      //   title: "Xspector",
      //   url: "/dashboard/coming-soon",
      //   icon: Forklift,
      //   comingSoon: true,
      // },
      {
        title: "Budget",
        url: "/budget",
        icon: Banknote,
        comingSoon: false,
      },
      {
        title: "Project",
        url: "/project",
        icon: Banknote,
        comingSoon: false,
      },
      {
        title: "Chat",
        url: "/chat",
        icon: Forklift,
        comingSoon: false,
      },
      {
        title: "Purchase Request",
        url: "/purchase",
        icon: ClipboardList,
        comingSoon: false,
      },
      {
        title: "BTM",
        url: "/booking-car",
        icon: Car,
        comingSoon: false,
      },
      {
        title: "Facility QI",
        url: "/facility-quality-inspection",
        icon: ClipboardCheck,
        comingSoon: false,
      },
      {
        title: "SSHE",
        url: "/booking-car",
        icon: Car,
        comingSoon: false,
        subItems: [
          {
            title: "E-SOC",
            url: "/auth/v1/login",
            newTab: true,
            comingSoon: true,
          },
          {
            title: "ISO Center",
            url: "/auth/v2/login",
            newTab: true,
            comingSoon: true,
          },
          { title: "Inspection", url: "/auth/v1/register" },
          {
            title: "E-Permit",
            url: "/auth/v2/register",
            newTab: true,
            comingSoon: true,
          },
          {
            title: "E-Audit",
            url: "/auth/v2/register",
            newTab: true,
            comingSoon: true,
          },
          {
            title: "E-Mom",
            url: "/auth/v2/register",
            newTab: true,
            comingSoon: true,
          },
        ],
      },
      {
        title: "User",
        url: "/user",
        icon: UserIcon,
        comingSoon: false,
      },
    ],
  },
  // {
  //   id: 2,
  //   label: "History chat",
  //   dynamicChats: true,
  //   items: [],
  // },
  // {
  //   id: 3,
  //   label: "Pages",
  //   items: [
  //     {
  //       title: "Email",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Chat",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Calendar",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Kanban",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Invoice",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Users",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "Roles",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //     {
  //       title: "SSHE",
  //       url: "/auth",
  //       icon: Car,
  //       subItems: [
  //         { title: "E-SOC", url: "/auth/v1/login", newTab: true },
  //         { title: "ISO Center", url: "/auth/v2/login", newTab: true },
  //         { title: "Inspection", url: "/auth/v1/register", newTab: true },
  //         { title: "E-Permit", url: "/auth/v2/register", newTab: true },
  //         { title: "E-Audit", url: "/auth/v2/register", newTab: true },
  //         { title: "E-Mom", url: "/auth/v2/register", newTab: true },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   id: 3,
  //   label: "Misc",
  //   items: [
  //     {
  //       title: "Others",
  //       url: "/dashboard/coming-soon",
  //       icon: Car,
  //       comingSoon: true,
  //     },
  //   ],
  // },
];
