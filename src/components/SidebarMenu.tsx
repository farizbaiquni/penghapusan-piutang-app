"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FilePlus,
  FolderOpen,
  Users,
  History,
  ShieldCheck,
  CircleCheckBig,
  Send,
  FileSignature,
  BarChart3,
  Search,
  ClipboardCheck,
  Stamp,
  FileWarning,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";

interface SidebarMenuProps {
  role: "SKPD" | "BPKAD" | "INSPEKTORAT";
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
}

export default function SidebarMenu({ role, activeMenu, onMenuChange }: SidebarMenuProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar untuk auto-minimize
  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true); // mobile selalu collapsed
      }
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Toggle manual (hanya untuk desktop)
  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed((prev) => !prev);
    }
  };

  // Menu definitions berdasarkan role
  const skpdMenus = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "ajukan", label: "Ajukan Penghapusan Piutang", icon: FilePlus, badge: null },
    { id: "dokumen", label: "Dokumen Penghapusan Piutang", icon: FolderOpen, badge: null },
    { id: "nominatif", label: "Nominatif Penanggung Utang", icon: Users, badge: null },
    { id: "riwayat", label: "Riwayat Pengajuan", icon: History, badge: null },
  ];

  const bpkadMenus = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "verifikasiPUPN", label: "Verifikasi (Jalur PUPN)", icon: ShieldCheck, badge: "TPUPPD" },
    { id: "verifikasiNonPUPN", label: "Verifikasi (Jalur Non-PUPN)", icon: CircleCheckBig, badge: "PPKD" },
    { id: "usulPUPN", label: "Usul ke PUPN", icon: Send, badge: null },
    { id: "terbitPPDTO", label: "Terbitkan PPDTO", icon: FileSignature, badge: null },
    { id: "laporan", label: "Laporan Monitoring", icon: BarChart3, badge: null },
  ];

  const inspektoratMenus = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "reviuPUPN", label: "Reviu Berkas (Jalur PUPN)", icon: Search, badge: null },
    { id: "reviuNonPUPN", label: "Reviu Berkas (Non-PUPN)", icon: ClipboardCheck, badge: null },
    { id: "persetujuan", label: "Persetujuan Penghapusan Bersyarat", icon: Stamp, badge: null },
    { id: "rekomendasi", label: "Rekomendasi / Penolakan", icon: FileWarning, badge: null },
  ];

  let menus = [];
  if (role === "SKPD") menus = skpdMenus;
  else if (role === "BPKAD") menus = bpkadMenus;
  else menus = inspektoratMenus;

  return (
    <aside
      className={`bg-primary-deep text-white flex flex-col h-screen sticky top-0 overflow-y-auto shadow-lg transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo / Brand */}
      <div className={`px-4 py-5 border-b border-white/10 flex ${isCollapsed ? "justify-center" : ""}`}>
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-md">
            <LayoutDashboard className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-sm font-bold text-white">SIMPUL KENDAL</h1>
              <p className="text-xs text-white/60">Piutang Daerah</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          if (isCollapsed) {
            // Mode collapsed: hanya ikon, tooltip menggunakan atribut title
            return (
              <button
                key={item.id}
                onClick={() => onMenuChange(item.id)}
                title={item.label}
                className="w-full flex items-center justify-center px-0 py-3 rounded-md text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <Icon className="w-5 h-5 text-white/80" strokeWidth={2.5} />
              </button>
            );
          }

          // Mode expanded: ikon + teks + badge
          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={`w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 text-left cursor-pointer ${
                isActive ? "bg-white/20 text-white shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-white/80"}`}
                strokeWidth={2.5}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full flex-shrink-0 font-semibold">
                  {item.badge}
                </span>
              )}
              {isActive && <div className="w-1 h-6 bg-white rounded-full flex-shrink-0 ml-1" />}
            </button>
          );
        })}
      </nav>

      {/* Footer: Logout + Toggle Manual (Desktop Only) */}
      <div className="p-3 border-t border-white/10 space-y-3">
        {/* Logout */}
        {isCollapsed ? (
          <button
            onClick={() => alert("Logout")}
            title="Logout"
            className="w-full flex items-center justify-center py-3 rounded-md text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" strokeWidth={2.5} />
          </button>
        ) : (
          <button
            onClick={() => alert("Logout")}
            className="w-full flex items-center justify-start gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={2.5} />
            <span>Logout</span>
          </button>
        )}

        {/* Toggle Button - Hanya tampil di desktop (lebar ≥ 768px) */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-start"} gap-3 py-3 rounded-md text-sm font-medium text-white/70 hover:bg-white/10 transition cursor-pointer select-none`}
            title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" strokeWidth={2.5} />
            ) : (
              <>
                <PanelLeftClose className="w-5 h-5" strokeWidth={2.5} />
                <span className="ml-2">Ciutkan</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}