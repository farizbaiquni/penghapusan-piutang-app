"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, User, LogOut, ChevronDown, UserCircle } from "lucide-react";

interface HeaderNavbarProps {
  role: "SKPD" | "BPKAD" | "INSPEKTORAT";
  onRoleChange: (role: "SKPD" | "BPKAD" | "INSPEKTORAT") => void;
}

export default function HeaderNavbar({ role, onRoleChange }: HeaderNavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleDisplay = {
    SKPD: "SKPD",
    BPKAD: "BPKAD",
    INSPEKTORAT: "Inspektorat",
  };

  const roleFull = {
    SKPD: "SKPD (Pengguna Anggaran)",
    BPKAD: "BPKAD / PPKD",
    INSPEKTORAT: "Inspektorat Daerah",
  };

  const nextRole = () => {
    const order: ("SKPD" | "BPKAD" | "INSPEKTORAT")[] = ["SKPD", "BPKAD", "INSPEKTORAT"];
    const currentIdx = order.indexOf(role);
    const next = order[(currentIdx + 1) % order.length];
    onRoleChange(next);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-primary p-2 rounded-md shadow-sm">
                <FileText className="w-5 h-5 text-white" strokeWidth={1.75} />
              </div>
              <span className="text-base font-semibold text-primary whitespace-nowrap">SIMPUL KENDAL</span>
              <span className="hidden md:inline text-xs text-gray-400 ml-1">Kab. Kendal</span>
            </div>

            {/* Kanan: Role Selector + User Menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Role Selector */}
              <div className="relative">
                <button
                  onClick={nextRole}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition whitespace-nowrap"
                  aria-label="Ganti role"
                >
                  <UserCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.75} />
                  {/* Teks full hanya di lg ke atas */}
                  <span className="hidden lg:inline">{roleFull[role]}</span>
                  {/* Teks singkat di md */}
                  <span className="hidden sm:inline lg:hidden">{roleDisplay[role]}</span>
                  {/* Ikon chevron hanya di lg ke atas */}
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 hidden lg:block" />
                </button>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" strokeWidth={1.75} />
                  </div>
                  {/* Nama user hanya tampil di lg ke atas */}
                  <span className="hidden lg:inline text-sm font-medium text-gray-700">
                    {role === "SKPD" && "Andi Saputra"}
                    {role === "BPKAD" && "Budi Santoso"}
                    {role === "INSPEKTORAT" && "Siti Nurjanah"}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">
                        {role === "SKPD" && "Andi Saputra"}
                        {role === "BPKAD" && "Budi Santoso"}
                        {role === "INSPEKTORAT" && "Siti Nurjanah"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {role === "SKPD" && "skpd@kendalkab.go.id"}
                        {role === "BPKAD" && "bpkad@kendalkab.go.id"}
                        {role === "INSPEKTORAT" && "inspektorat@kendalkab.go.id"}
                      </p>
                    </div>
                    <button
                      onClick={() => alert("Logout")}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.75} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="bg-primary-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-medium">
              {role === "SKPD" && "SKPD: Pengajuan Penghapusan Piutang"}
              {role === "BPKAD" && "BPKAD: Verifikasi dan Penetapan"}
              {role === "INSPEKTORAT" && "Inspektorat: Reviu dan Rekomendasi"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}