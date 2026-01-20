import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Briefcase,
  Settings,
  ChartBar
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "../components/ui/sidebar";
//import logoPath from "@assets/570006557_1804615333498831_8118356708932147603_n_1762095297397.jpg";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Revenues",
    url: "/revenues",
    icon: TrendingUp,
  },
  {
    title: "Expenses",
    url: "/expenses",
    icon: TrendingDown,
  },
  {
    title: "Receipts & Expenditures",
    url: "/receipts-expenditures",
    icon: FileText,
  },
  {
    title: "Fund Operations",
    url: "/fund-operations",
    icon: Briefcase,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: ChartBar,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <img 
            //src={logoPath} 
            alt="Barangay San Agustin Logo" 
            className="h-14 w-14 rounded-full object-cover"
          />
          <div>
            <h2 className="text-sm font-semibold text-sidebar-foreground font-poppins">
              Barangay San Agustin
            </h2>
            <p className="text-xs text-muted-foreground">
              Financial Monitoring System
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Financial Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
