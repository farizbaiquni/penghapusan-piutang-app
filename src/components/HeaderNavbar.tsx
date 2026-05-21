"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Check, UserCircle } from "lucide-react";

interface HeaderNavbarProps {
  role: "SKPD" | "BPKAD" | "INSPEKTORAT";
  onRoleChange: (role: "SKPD" | "BPKAD" | "INSPEKTORAT") => void;
}

const roles: {
  id: "SKPD" | "BPKAD" | "INSPEKTORAT";
  label: string;
  labelFull: string;
  nama: string;
  email: string;
  avatar: string;
  color: string;
}[] = [
  {
    id: "SKPD",
    label: "SKPD",
    labelFull: "SKPD (Pengguna Anggaran)",
    nama: "SKPD Dinas A",
    email: "skpd@kendalkab.go.id",
    avatar: "AS",
    color: "bg-amber-400",
  },
  {
    id: "BPKAD",
    label: "BPKAD",
    labelFull: "PPKD",
    nama: "BPKAD / TPUPPD",
    email: "bpkad@kendalkab.go.id",
    avatar: "BS",
    color: "bg-sky-400",
  },
  {
    id: "INSPEKTORAT",
    label: "Inspektorat",
    labelFull: "Inspektorat Daerah",
    nama: "Inspektorat Daerah",
    email: "inspektorat@kendalkab.go.id",
    avatar: "SN",
    color: "bg-violet-400",
  },
];

export default function HeaderNavbar({ role, onRoleChange }: HeaderNavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const currentRole = roles.find((r) => r.id === role)!;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleSelect = (newRole: "SKPD" | "BPKAD" | "INSPEKTORAT") => {
    onRoleChange(newRole);
    setRoleMenuOpen(false);
    setUserMenuOpen(false);
  };

  const statusMap = {
    SKPD: { label: "Aktif", color: "bg-emerald-400" },
    BPKAD: { label: "Aktif", color: "bg-emerald-400" },
    INSPEKTORAT: { label: "Aktif", color: "bg-emerald-400" },
  };
  const status = statusMap[role];

  return (
    <>
      <nav
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className="bg-white border-b border-gray-100 sticky top-0 z-50"
      >
        <div className="px-5 sm:px-7">
          <div className="flex items-center justify-between h-[64px] gap-4">

            {/* Search Bar */}
            <div className={`relative flex-1 max-w-xs transition-all duration-200 ${searchFocused ? "max-w-sm" : ""}`}>
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Cari dokumen..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-transparent rounded-xl text-gray-600 placeholder-gray-300 focus:outline-none focus:bg-white focus:border-gray-200 transition-all"
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* Status Sistem */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-medium text-gray-500">Sistem</span>
                <span className={`w-2 h-2 rounded-full ${status.color} shadow-sm`} />
                <span className="text-xs font-semibold text-emerald-500">{status.label}</span>
              </div>

              {/* Notifikasi */}
              <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition">
                <Bell className="w-4 h-4 text-gray-400" strokeWidth={2} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-400 border-2 border-white" />
              </button>

              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-100" />

              {/* Role Selector Dropdown */}
              <div className="relative" ref={roleMenuRef}>
                <button
                  onClick={() => { setRoleMenuOpen((p) => !p); setUserMenuOpen(false); }}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition"
                  aria-expanded={roleMenuOpen}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl ${currentRole.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                    {currentRole.avatar}
                  </div>
                  <div className="hidden sm:block text-left leading-tight">
                    <p className="text-[13px] font-semibold text-gray-700">{currentRole.nama}</p>
                    <p className="text-[11px] text-gray-400">{currentRole.label}</p>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-300 hidden sm:block transition-transform duration-200 ${roleMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {roleMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {/* Header dropdown */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pilih Akun / Role</p>
                    </div>

                    <div className="p-2">
                      {roles.map((r) => {
                        const isActive = r.id === role;
                        return (
                          <button
                            key={r.id}
                            onClick={() => handleRoleSelect(r.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                              isActive ? "bg-rose-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl ${r.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}>
                              {r.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isActive ? "text-rose-500" : "text-gray-700"}`}>
                                {r.nama}
                              </p>
                              <p className="text-xs text-gray-400 truncate">{r.labelFull}</p>
                            </div>
                            {isActive && (
                              <div className="w-5 h-5 rounded-full bg-rose-400 flex items-center justify-center flex-shrink-0">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className="bg-white border-b border-gray-100"
      >
        <div className="px-5 sm:px-7 py-2.5 flex items-center gap-2 text-xs text-gray-400">
          <span className="text-gray-300">SiPuspita</span>
          <span className="text-gray-200">/</span>
          <span className="font-medium text-gray-500">
            {role === "SKPD" && "Pengajuan Penghapusan Piutang"}
            {role === "BPKAD" && "Verifikasi dan Penetapan"}
            {role === "INSPEKTORAT" && "Reviu dan Rekomendasi"}
          </span>
        </div>
      </div>
    </>
  );
}