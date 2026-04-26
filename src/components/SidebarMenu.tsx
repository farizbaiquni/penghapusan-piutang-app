"use client";

import {
  FileText,
  LayoutDashboard,
  Settings,
  FileSpreadsheet,
  Users,
  BarChart3,
  LogOut,
} from "lucide-react";

export type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

export const menuItems: MenuItem[] = [
  { id: "usulan", label: "Usulan Piutang", icon: FileSpreadsheet },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "laporan", label: "Laporan", icon: BarChart3 },
  { id: "master", label: "Master Data", icon: Users },
  { id: "pengaturan", label: "Pengaturan", icon: Settings },
];

type SidebarMenuProps = {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
};

export default function SidebarMenu({
  activeMenu,
  onMenuChange,
}: SidebarMenuProps) {
  return (
    <aside className="w-64 bg-primary-deep text-white flex flex-col h-screen sticky top-0 overflow-y-auto shadow-lg">
      {/* Logo / Brand Sidebar */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">E-Kendal</h1>
            <p className="text-xs text-white/60">Piutang Daerah</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${
                  isActive
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-white" : "text-white/60"}`}
              />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1 h-6 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Sidebar - Logout */}
      <div className="p-3 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
