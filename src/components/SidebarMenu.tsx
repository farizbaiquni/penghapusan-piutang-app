// components/SidebarMenu.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  History,
  Tag,
  Package,
  Archive,
  MessageSquare,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  CircleCheckBig,
  FileText,
} from "lucide-react";

interface SidebarMenuProps {
  role: "SKPD" | "BPKAD" | "INSPEKTORAT";
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
};

export default function SidebarMenu({ role, activeMenu, onMenuChange }: SidebarMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const toggleSidebar = () => {
    if (!isMobile) setIsCollapsed((prev) => !prev);
  };

  let menus: MenuItem[] = [];

  if (role === "BPKAD") {
    menus = [
      { id: "verifikasiPUPN", label: "Verifikasi PUPN", icon: ShieldCheck, badge: "TPUPPD" },
      { id: "verifikasiNonPUPN", label: "Verifikasi Non‑PUPN", icon: CircleCheckBig, badge: "PPKD" },
    ];
  } else if (role === "SKPD") {
    menus = [
      { id: "ajukan", label: "Ajukan", icon: ShieldCheck },
      { id: "dokumen", label: "Dokumen", icon: FileText },
    ];
  } else if (role === "INSPEKTORAT") {
    menus = [
      { id: "reviuPUPN", label: "Reviu PUPN", icon: ShieldCheck },
      { id: "reviuNonPUPN", label: "Reviu Non‑PUPN", icon: CircleCheckBig },
    ];
  }

  const roleLabel = role === "SKPD" ? "SKPD" : role === "BPKAD" ? "BPKAD" : "Inspektorat";
  const roleSubLabel = role === "SKPD" ? "Pengguna Anggaran" : role === "BPKAD" ? "PPKD / TPUPPD" : "Daerah";

  return (
    <aside
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className={`bg-white text-gray-700 flex flex-col h-screen sticky top-0 overflow-y-auto transition-all duration-300 border-r border-gray-100 ${
        isCollapsed ? "w-[72px]" : "w-[220px]"
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-5 py-5 ${isCollapsed ? "justify-center px-0" : ""}`}>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-500 shadow-md shadow-rose-200 flex-shrink-0">
          <Zap className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
        </div>
        {!isCollapsed && (
          <div className="leading-tight">
            <span className="text-[15px] font-bold text-gray-800 tracking-tight">SiPuspita</span>
            <p className="text-[10px] text-gray-400 font-medium">Kab. Kendal</p>
          </div>
        )}
      </div>

      {/* Role chip */}
      {!isCollapsed && (
        <div className="mx-4 mb-4 px-3 py-2 bg-rose-50 rounded-xl border border-rose-100">
          <p className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider">{roleLabel}</p>
          <p className="text-[11px] text-gray-400">{roleSubLabel}</p>
        </div>
      )}

      {/* Menu label */}
      {!isCollapsed && (
        <p className="px-5 mb-2 text-[10px] font-semibold text-gray-300 uppercase tracking-widest">Menu</p>
      )}

      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}
                ${isActive
                  ? "bg-rose-50 text-rose-500"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                }`}
            >
              <Icon
                className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-rose-500" : "text-gray-400"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                      isActive ? "bg-rose-100 text-rose-500" : "bg-gray-100 text-gray-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="w-1.5 h-5 bg-rose-400 rounded-full flex-shrink-0" />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-gray-100" />

      {/* Footer */}
      <div className="px-3 pb-5 space-y-0.5">
        {/* Settings */}
        <button
          title={isCollapsed ? "Pengaturan" : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition cursor-pointer
            ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}`}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
          {!isCollapsed && <span>Pengaturan</span>}
        </button>

        {/* Logout */}
        <button
          onClick={() => alert("Logout")}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-50 hover:text-red-400 transition cursor-pointer
            ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}`}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
          {!isCollapsed && <span>Logout</span>}
        </button>

        {/* Collapse toggle */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? "Perluas" : "Ciutkan"}
            className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-gray-300 hover:bg-gray-50 hover:text-gray-500 transition cursor-pointer select-none
              ${isCollapsed ? "justify-center px-0 py-3" : "px-3 py-2.5"}`}
          >
            {isCollapsed
              ? <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={2} />
              : (
                <>
                  <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={2} />
                  <span>Ciutkan</span>
                </>
              )
            }
          </button>
        )}
      </div>
    </aside>
  );
}