"use client";

import { useState, useEffect } from "react";
import HeaderNavbar from "@/components/HeaderNavbar";
import SidebarMenu from "@/components/SidebarMenu";
import PengajuanPenghapusanPiutang from "@/components/contents/PengajuanPenghapusanPiutangContent";
import DashboardContent from "@/components/contents/DashboardContent";
import SettingsContent from "@/components/contents/SettingsContent";
import { UsulanPiutang } from "@/lib/pdfGenerator";

// Menu pertama yang aktif saat masuk ke suatu role
const defaultMenus: Record<string, string> = {
  SKPD: "ajukan",
  BPKAD: "verifikasiPUPN",
  INSPEKTORAT: "reviuPUPN",
};

export default function HomePage() {
  const [role, setRole] = useState<"SKPD" | "BPKAD" | "INSPEKTORAT">("SKPD");
  const [activeMenu, setActiveMenu] = useState(defaultMenus["SKPD"]);
  const [usulanList, setUsulanList] = useState<UsulanPiutang[]>([]);
  const [useShortFormat, setUseShortFormat] = useState(true);

  // Reset activeMenu setiap kali role berubah
  useEffect(() => {
    setActiveMenu(defaultMenus[role]);
  }, [role]);

  const formatRupiahShort = (angka: number): string => {
    if (angka === 0) return "Rp 0";
    const isNegative = angka < 0;
    const prefix = isNegative ? "-Rp " : "Rp ";
    const value = Math.abs(angka);
    if (value >= 1_000_000_000_000) return `${prefix}${(value / 1_000_000_000_000).toFixed(2)} T`;
    if (value >= 1_000_000_000) return `${prefix}${(value / 1_000_000_000).toFixed(2)} M`;
    if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(2)} Jt`;
    if (value >= 1_000) return `${prefix}${(value / 1_000).toFixed(2)} Rb`;
    return `${prefix}${value.toLocaleString("id-ID")}`;
  };

  const formatRupiahFull = (angka: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatRupiah = (angka: number): string => {
    return useShortFormat ? formatRupiahShort(angka) : formatRupiahFull(angka);
  };

  const renderContent = () => {
    // ==================== SKPD ====================
    if (role === "SKPD") {
      switch (activeMenu) {
        case "ajukan":
          return <PengajuanPenghapusanPiutang role={role} />;
        case "dashboard":
          return (
            <DashboardContent
              usulanList={usulanList}
              formatRupiah={formatRupiah}
              useShortFormat={useShortFormat}
              role={role}
            />
          );
        case "dokumen":
          return (
            <div className="p-6 text-center text-gray-500">
              Halaman Dokumen Penghapusan Piutang (dalam pengembangan)
            </div>
          );
        case "nominatif":
          return (
            <div className="p-6 text-center text-gray-500">
              Halaman Nominatif Penanggung Utang (dalam pengembangan)
            </div>
          );
        case "riwayat":
          return (
            <div className="p-6 text-center text-gray-500">
              Halaman Riwayat Pengajuan (dalam pengembangan)
            </div>
          );
        case "pengaturan":
          return (
            <SettingsContent
              useShortFormat={useShortFormat}
              setUseShortFormat={setUseShortFormat}
            />
          );
        default:
          return <PengajuanPenghapusanPiutang role={role} />;
      }
    }

    // ==================== BPKAD ====================
    if (role === "BPKAD") {
      switch (activeMenu) {
        case "dashboard":
          return (
            <DashboardContent
              usulanList={usulanList}
              formatRupiah={formatRupiah}
              useShortFormat={useShortFormat}
              role={role}
            />
          );
        case "verifikasiPUPN":
          return (
            <div className="p-6 text-center text-gray-500">
              Verifikasi Berkas (Jalur PUPN) – Dalam Pengembangan
            </div>
          );
        case "verifikasiNonPUPN":
          return (
            <div className="p-6 text-center text-gray-500">
              Verifikasi Berkas (Jalur Non‑PUPN) – Dalam Pengembangan
            </div>
          );
        case "usulPUPN":
          return (
            <div className="p-6 text-center text-gray-500">
              Usul ke PUPN – Dalam Pengembangan
            </div>
          );
        case "terbitPPDTO":
          return (
            <div className="p-6 text-center text-gray-500">
              Terbitkan PPDTO – Dalam Pengembangan
            </div>
          );
        case "laporan":
          return (
            <div className="p-6 text-center text-gray-500">
              Laporan Monitoring – Dalam Pengembangan
            </div>
          );
        case "pengaturan":
          return (
            <SettingsContent
              useShortFormat={useShortFormat}
              setUseShortFormat={setUseShortFormat}
            />
          );
        default:
          return (
            <DashboardContent
              usulanList={usulanList}
              formatRupiah={formatRupiah}
              useShortFormat={useShortFormat}
              role={role}
            />
          );
      }
    }

    // ==================== INSPEKTORAT ====================
    if (role === "INSPEKTORAT") {
      switch (activeMenu) {
        case "dashboard":
          return (
            <DashboardContent
              usulanList={usulanList}
              formatRupiah={formatRupiah}
              useShortFormat={useShortFormat}
              role={role}
            />
          );
        case "reviuPUPN":
          return (
            <div className="p-6 text-center text-gray-500">
              Reviu Berkas (Jalur PUPN) – Dalam Pengembangan
            </div>
          );
        case "reviuNonPUPN":
          return (
            <div className="p-6 text-center text-gray-500">
              Reviu Berkas (Non‑PUPN) – Dalam Pengembangan
            </div>
          );
        case "persetujuan":
          return (
            <div className="p-6 text-center text-gray-500">
              Persetujuan Penghapusan Bersyarat – Dalam Pengembangan
            </div>
          );
        case "rekomendasi":
          return (
            <div className="p-6 text-center text-gray-500">
              Rekomendasi / Penolakan – Dalam Pengembangan
            </div>
          );
        case "pengaturan":
          return (
            <SettingsContent
              useShortFormat={useShortFormat}
              setUseShortFormat={setUseShortFormat}
            />
          );
        default:
          return (
            <DashboardContent
              usulanList={usulanList}
              formatRupiah={formatRupiah}
              useShortFormat={useShortFormat}
              role={role}
            />
          );
      }
    }

    // Fallback (seharusnya tidak pernah terjadi)
    return <div className="p-6 text-center text-red-500">Akses tidak diizinkan</div>;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarMenu
        role={role}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNavbar role={role} onRoleChange={setRole} />
        <main className="flex-1 overflow-y-auto bg-gray-100">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}