"use client";

import { useState, useEffect } from "react";
import HeaderNavbar from "@/components/HeaderNavbar";
import SidebarMenu from "@/components/SidebarMenu";
import PengajuanPenghapusanPiutang, {
  DokumenInduk,
} from "@/components/contents/skpd/PengajuanPenghapusanPiutangContent";
import DashboardContent from "@/components/contents/DashboardContent";
import SettingsContent from "@/components/contents/SettingsContent";
import DokumenPenghapusanPiutangContent from "@/components/contents/skpd/DokumenPenghapusanPiutangContent";
import VerifikasiPUPNContent, {
  VerifikasiPUPNData,
} from "@/components/contents/bpkad/VerifikasiPUPNContent";
import { UsulanPiutang } from "@/lib/pdfGenerator";
import {
  FormDataPUPN,
  FormDataNonPUPN,
} from "@/components/modals/FormPenanggungUtangModal";
import UnsavedChangesModal from "@/components/modals/UnsavedChangesModal";

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
  const [dokumenIndukList, setDokumenIndukList] = useState<DokumenInduk[]>([]);
  // Menyimpan daftar nominatif untuk setiap dokumen (key: dokumenId)
  const [nominatifMap, setNominatifMap] = useState<
    Record<number, (FormDataPUPN | FormDataNonPUPN)[]>
  >({});
  // Menyimpan data verifikasi PUPN per dokumen
  const [verifikasiPUPNMap, setVerifikasiPUPNMap] = useState<
    Record<number, VerifikasiPUPNData>
  >({});

  // ---- State untuk modal konfirmasi navigasi ----
  const [unsavedState, setUnsavedState] = useState<{
    hasUnsaved: boolean;
    judul: string;
    nominatifCount: number;
    triggerSaveDraft: () => void;
    triggerDiscard: () => void;
  } | null>(null);
  const [pendingMenu, setPendingMenu] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Intersep klik menu sidebar: jika SKPD sedang di wizard ajukan + ada unsaved → modal
  const handleMenuChange = (menuId: string) => {
    if (
      role === "SKPD" &&
      activeMenu === "ajukan" &&
      menuId !== "ajukan" &&
      unsavedState?.hasUnsaved
    ) {
      setPendingMenu(menuId);
      setShowUnsavedModal(true);
      return;
    }
    setActiveMenu(menuId);
  };

  const handleUnsavedSaveDraft = () => {
    unsavedState?.triggerSaveDraft();
    setShowUnsavedModal(false);
    if (pendingMenu) setActiveMenu(pendingMenu);
    setPendingMenu(null);
  };

  const handleUnsavedDiscard = () => {
    unsavedState?.triggerDiscard();
    setShowUnsavedModal(false);
    if (pendingMenu) setActiveMenu(pendingMenu);
    setPendingMenu(null);
  };

  const handleUnsavedCancel = () => {
    setShowUnsavedModal(false);
    setPendingMenu(null);
  };

  useEffect(() => {
    setActiveMenu(defaultMenus[role]);
  }, [role]);

  // ---- Format Rupiah ----
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

  // ---- Callback dari wizard pengajuan (menggantikan addDokumenInduk) ----
  const handleSaveDokumen = (
    dokumen: DokumenInduk,
    nominatifList: (FormDataPUPN | FormDataNonPUPN)[]
  ) => {
    // Jika SKPD mengirim (bukan simpan draft), ubah status ke MENUNGGU_VERIFIKASI_PPKD
    const dokumenFinal: DokumenInduk = {
      ...dokumen,
      status:
        dokumen.status === "DIAJUKAN"
          ? "MENUNGGU_VERIFIKASI_PPKD"
          : dokumen.status,
    };

    setDokumenIndukList((prev) => {
      const existingIndex = prev.findIndex((d) => d.id === dokumenFinal.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = dokumenFinal;
        return updated;
      } else {
        return [...prev, dokumenFinal];
      }
    });

    // Simpan/update nominatifMap
    setNominatifMap((prev) => ({
      ...prev,
      [dokumenFinal.id]: nominatifList,
    }));
  };

  const deleteDokumenInduk = (id: number) => {
    setDokumenIndukList((prev) => prev.filter((doc) => doc.id !== id));
    // Hapus juga data nominatifnya
    setNominatifMap((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    // Hapus data verifikasi jika ada
    setVerifikasiPUPNMap((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const editDokumenInduk = (id: number, judulBaru: string) => {
    setDokumenIndukList((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, judul: judulBaru } : doc))
    );
  };

  // ---- Menambah nominatif dari DokumenPenghapusanPiutangContent ----
  const handleAddNominatif = (
    dokumenId: number,
    data: FormDataPUPN | FormDataNonPUPN
  ) => {
    const newNominatif = {
      id: Date.now(),
      ...data,
      dokumenId,
    };

    setNominatifMap((prev) => ({
      ...prev,
      [dokumenId]: [...(prev[dokumenId] || []), newNominatif],
    }));

    setDokumenIndukList((prev) =>
      prev.map((doc) =>
        doc.id === dokumenId
          ? { ...doc, nominatifIds: [...doc.nominatifIds, newNominatif.id] }
          : doc
      )
    );
  };

  // ---- Render Konten Berdasarkan Role ----
  const renderContent = () => {
    // ========== SKPD ==========
    if (role === "SKPD") {
      switch (activeMenu) {
        case "ajukan":
          return (
            <PengajuanPenghapusanPiutang
              role={role}
              onSaveDokumen={handleSaveDokumen}
              onUnsavedChange={setUnsavedState}
            />
          );
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
            <DokumenPenghapusanPiutangContent
              dokumenIndukList={dokumenIndukList}
              nominatifMap={nominatifMap}
              onDeleteDokumen={deleteDokumenInduk}
              onAddNominatif={handleAddNominatif}
            />
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
          return (
            <PengajuanPenghapusanPiutang
              role={role}
              onSaveDokumen={handleSaveDokumen}
              onUnsavedChange={setUnsavedState}
            />
          );
      }
    }

    // ========== BPKAD ==========
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
        case "verifikasiPUPN": {
          // Filter dokumen PUPN yang menunggu verifikasi
          const dokumenPUPN = dokumenIndukList.filter(
            (doc) =>
              doc.jenisPengajuan === "PUPN" &&
              (doc.status === "DIAJUKAN" ||
                doc.status === "MENUNGGU_VERIFIKASI_PPKD")
          );
          return (
            <VerifikasiPUPNContent
              dokumenIndukList={dokumenPUPN}
              nominatifMap={nominatifMap}
              onTerima={(dokumenId, data) => {
                // Simpan data verifikasi
                setVerifikasiPUPNMap((prev) => ({
                  ...prev,
                  [dokumenId]: data,
                }));
                // Ubah status menjadi MENUNGGU_REVIU_INSPEKTORAT
                setDokumenIndukList((prev) =>
                  prev.map((d) =>
                    d.id === dokumenId
                      ? { ...d, status: "MENUNGGU_REVIU_INSPEKTORAT" }
                      : d
                  )
                );
              }}
              onTolak={(dokumenId, data, alasan) => {
                setVerifikasiPUPNMap((prev) => ({
                  ...prev,
                  [dokumenId]: data,
                }));
                setDokumenIndukList((prev) =>
                  prev.map((d) =>
                    d.id === dokumenId
                      ? { ...d, status: "DITOLAK_PPKD" }
                      : d
                  )
                );
                // Alasan penolakan bisa disimpan di data tambahan atau state terpisah
                console.log("Alasan penolakan PUPN:", alasan);
              }}
            />
          );
        }
        case "verifikasiNonPUPN":
          return (
            <div className="p-6 text-center text-gray-500">
              Verifikasi Berkas (Jalur Non‑PUPN) – Dalam Pengembangan
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

    // ========== INSPEKTORAT ==========
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

    return (
      <div className="p-6 text-center text-red-500">Akses tidak diizinkan</div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarMenu
        role={role}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNavbar role={role} onRoleChange={setRole} />
        <main className="flex-1 overflow-y-auto bg-gray-100">
          {renderContent()}
        </main>
      </div>
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        judul={unsavedState?.judul}
        nominatifCount={unsavedState?.nominatifCount}
        onSaveDraft={handleUnsavedSaveDraft}
        onDiscard={handleUnsavedDiscard}
        onCancel={handleUnsavedCancel}
      />
    </div>
  );
}