"use client";

import { useState } from "react";
import HeaderNavbar from "@/components/HeaderNavbar";
import SidebarMenu from "@/components/SidebarMenu";
import UsulanPiutangContent from "@/components/contents/UsulanPiutangContent";
import DashboardContent from "@/components/contents/DashboardContent";
import SettingsContent from "@/components/contents/SettingsContent";
import { UsulanPiutang } from "@/lib/pdfGenerator";

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState("usulan");
  const [usulanList, setUsulanList] = useState<UsulanPiutang[]>([]);
  const [useShortFormat, setUseShortFormat] = useState(true);

  const formatRupiahShort = (angka: number): string => {
    if (angka === 0) return "Rp 0";
    if (!angka) return "Rp 0";

    const isNegative = angka < 0;
    const prefix = isNegative ? "-Rp " : "Rp ";
    const value = Math.abs(angka);

    if (value >= 1_000_000_000_000_000) {
      return `${prefix}${(value / 1_000_000_000_000_000).toFixed(2)} Kuadriliun`;
    }
    if (value >= 1_000_000_000_000) {
      return `${prefix}${(value / 1_000_000_000_000).toFixed(2)} Triliun`;
    }
    if (value >= 1_000_000_000) {
      return `${prefix}${(value / 1_000_000_000).toFixed(2)} Miliar`;
    }
    if (value >= 1_000_000) {
      return `${prefix}${(value / 1_000_000).toFixed(2)} Juta`;
    }
    if (value >= 1_000) {
      return `${prefix}${(value / 1_000).toFixed(2)} Ribu`;
    }

    return `${prefix}${value.toLocaleString("id-ID")}`;
  };

  const formatRupiahFull = (angka: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const formatRupiah = (angka: number): string => {
    if (useShortFormat) {
      return formatRupiahShort(angka);
    }
    return formatRupiahFull(angka);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "usulan":
        return (
          <UsulanPiutangContent
            usulanList={usulanList}
            setUsulanList={setUsulanList}
          />
        );
      case "dashboard":
        return (
          <DashboardContent
            usulanList={usulanList}
            formatRupiah={formatRupiah}
            useShortFormat={useShortFormat}
          />
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
          <div className="p-6">
            <div className="bg-white rounded-md border border-gray-200 p-12 text-center shadow-sm">
              <h2 className="text-lg font-medium text-gray-700">
                Menu sedang dalam pengembangan
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Fitur ini akan segera tersedia
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarMenu activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNavbar />
        <main className="flex-1 overflow-y-auto bg-gray-100">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
