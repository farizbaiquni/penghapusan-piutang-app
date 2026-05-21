// components/contents/bpkad/VerifikasiNonPUPNContent.tsx
"use client";

import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Paperclip,
  AlertCircle,
  Users,
  Hash,
  Briefcase,
  MapPin,
  ReceiptText,
  ChevronRight,
  Check,
  X,
  ClipboardCheck,
  MessageSquare,
  Eye,
  Calendar,
  DollarSign,
  CreditCard,
} from "lucide-react";

import { DokumenInduk } from "@/components/contents/skpd/PengajuanPenghapusanPiutangContent";
import { FormDataNonPUPN, Pembayaran } from "@/components/modals/FormPenanggungUtangModal";

// ─────────────────────────── Types ───────────────────────────

export type VerifikasiNonPUPNData = {
  checklist: Record<number, Record<string, "Sesuai" | "Tidak Sesuai" | undefined>>;
  keterangan: Record<number, string>;
  globalKeterangan: string;
  nomorPPDTO: Record<number, string>;
};

interface VerifikasiNonPUPNContentProps {
  dokumenIndukList: DokumenInduk[];
  nominatifMap: Record<number, FormDataNonPUPN[]>;
  onTerima: (dokumenId: number, data: VerifikasiNonPUPNData) => void;
  onTolak: (dokumenId: number, data: VerifikasiNonPUPNData, alasan: string) => void;
}

// ─────────────────────────── Constants ───────────────────────────

const DOKUMEN_OPSIONAL_NON_PUPN = [
  { id: "kk_miskin", label: "Kartu Keluarga Miskin" },
  { id: "putusan_pailit", label: "Putusan Pailit" },
  { id: "surat_lurah", label: "Surat Keterangan dari Lurah" },
  { id: "bansos", label: "Bukti Penerimaan Bansos/Asuransi Kesehatan Miskin" },
  { id: "kunjungan_ppkd", label: "Bukti Kunjungan Penagihan oleh Petugas PPKD" },
  { id: "optimalisasi_lainnya", label: "Dokumen Bukti Optimalisasi Lainnya (MoU, Gugatan, dll.)" },
];

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatTanggal(dateStr: string): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ─────────────────────────── Progress Badge ───────────────────────────

function ChecklistProgress({
  nomId,
  checklist,
}: {
  nomId: number;
  checklist: Record<number, Record<string, "Sesuai" | "Tidak Sesuai" | undefined>>;
}) {
  const entries = Object.values(checklist[nomId] || {});
  const sesuai = entries.filter((v) => v === "Sesuai").length;
  const tidak = entries.filter((v) => v === "Tidak Sesuai").length;
  const total = DOKUMEN_OPSIONAL_NON_PUPN.length;

  if (entries.length === 0) {
    return <span className="text-xs text-gray-600">Belum diperiksa</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      {sesuai > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
          <Check className="w-3 h-3" />
          {sesuai}
        </span>
      )}
      {tidak > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
          <X className="w-3 h-3" />
          {tidak}
        </span>
      )}
      <span className="text-[11px] text-gray-600">/ {total}</span>
    </div>
  );
}

// ─────────────────────────── Preview File Button ───────────────────────────

function PreviewFileButton({ file }: { file: File | null | undefined }) {
  if (!file) return null;
  const handlePreview = () => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank");
    URL.revokeObjectURL(url);
  };
  return (
    <button
      onClick={handlePreview}
      className="w-8 h-8 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center"
      title="Preview dokumen"
    >
      <Eye className="w-4 h-4 text-gray-500" />
    </button>
  );
}

// ─────────────────────────── Main Component ───────────────────────────

export default function VerifikasiNonPUPNContent({
  dokumenIndukList,
  nominatifMap,
  onTerima,
  onTolak,
}: VerifikasiNonPUPNContentProps) {
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [activeNomIdx, setActiveNomIdx] = useState<number>(0);
  const [checklist, setChecklist] = useState<
    Record<number, Record<string, "Sesuai" | "Tidak Sesuai" | undefined>>
  >({});
  const [keterangan, setKeterangan] = useState<Record<number, string>>({});
  const [globalKeterangan, setGlobalKeterangan] = useState("");
  const [nomorPPDTO, setNomorPPDTO] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  const selectedDokumen = selectedDocId ? dokumenIndukList.find((d) => d.id === selectedDocId) : null;
  const nominatifList = selectedDocId ? (nominatifMap[selectedDocId] || []) : [];
  const activeNominatif = nominatifList[activeNomIdx] ?? null;
  const activeNomId = (activeNominatif as any)?.id ?? activeNomIdx;

  // ─────────────────────────── Handlers ───────────────────────────

  const handleSelectDoc = (docId: number) => {
    setSelectedDocId(docId);
    setActiveNomIdx(0);
    setChecklist({});
    setKeterangan({});
    setGlobalKeterangan("");
    setNomorPPDTO({});
    setError("");
  };

  const handleBack = () => {
    setSelectedDocId(null);
  };

  const handleChecklistChange = (
    nomId: number,
    docId: string,
    value: "Sesuai" | "Tidak Sesuai"
  ) => {
    setChecklist((prev) => ({
      ...prev,
      [nomId]: {
        ...prev[nomId],
        [docId]: prev[nomId]?.[docId] === value ? undefined : value,
      },
    }));
  };

  const handleNomorPPDTOChange = (nomId: number, value: string) => {
    setNomorPPDTO((prev) => ({ ...prev, [nomId]: value }));
    if (error) setError("");
  };

  const validateTerima = (): boolean => {
    // Cek setiap nominatif: semua checklist terisi dan nomor PPDTO tidak kosong
    for (let i = 0; i < nominatifList.length; i++) {
      const nom = nominatifList[i];
      const nomId = (nom as any).id ?? i;
      const checklistEntries = checklist[nomId] || {};
      const totalChecked = Object.keys(checklistEntries).length;
      if (totalChecked !== DOKUMEN_OPSIONAL_NON_PUPN.length) {
        setError(`Nominatif ${i + 1}: belum semua dokumen opsional diperiksa.`);
        setActiveNomIdx(i);
        return false;
      }
      const nomor = nomorPPDTO[nomId];
      if (!nomor || nomor.trim() === "") {
        setError(`Nominatif ${i + 1}: Nomor PPDTO wajib diisi.`);
        setActiveNomIdx(i);
        return false;
      }
    }
    return true;
  };

  const buildData = (): VerifikasiNonPUPNData => ({
    checklist: { ...checklist },
    keterangan: { ...keterangan },
    globalKeterangan,
    nomorPPDTO: { ...nomorPPDTO },
  });

  const handleTerima = () => {
    if (!selectedDocId || !validateTerima()) return;
    onTerima(selectedDocId, buildData());
    setSelectedDocId(null);
  };

  const handleTolak = () => {
    if (!selectedDocId) return;
    if (!globalKeterangan.trim()) {
      setError("Keterangan penolakan wajib diisi.");
      return;
    }
    onTolak(selectedDocId, buildData(), globalKeterangan);
    setSelectedDocId(null);
  };

  // ─────────────────────────── Progress ───────────────────────────

  const totalNominatif = nominatifList.length;
  const totalChecked = nominatifList.filter((_, i) => {
    const id = (nominatifList[i] as any)?.id ?? i;
    return Object.keys(checklist[id] || {}).length === DOKUMEN_OPSIONAL_NON_PUPN.length;
  }).length;
  const totalNomorFilled = nominatifList.filter((_, i) => {
    const id = (nominatifList[i] as any)?.id ?? i;
    return (nomorPPDTO[id] || "").trim() !== "";
  }).length;
  const readyCount = nominatifList.filter((_, i) => {
    const id = (nominatifList[i] as any)?.id ?? i;
    return Object.keys(checklist[id] || {}).length === DOKUMEN_OPSIONAL_NON_PUPN.length && 
           (nomorPPDTO[id] || "").trim() !== "";
  }).length;

  // ─────────────────────────── VIEW: LIST ───────────────────────────

  if (!selectedDocId) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Verifikasi Non-PUPN</h1>
                <p className="text-sm text-gray-500">Verifikasi pengajuan penghapusan piutang jalur Non-PUPN (PPDTO)</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-3xl font-bold text-primary">{dokumenIndukList.length}</p>
            <p className="text-xs text-gray-600 font-medium">Menunggu</p>
          </div>
        </div>

        {/* LIST DOKUMEN */}
        <div className="space-y-4">
          {dokumenIndukList.map((doc, idx) => {
            const nomCount = nominatifMap[doc.id]?.length ?? 0;
            const totalPiutang = (nominatifMap[doc.id] || []).reduce(
              (s, n) => s + (n.nilaiPiutang ?? 0),
              0
            );
            return (
              <div
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-base">{doc.judul}</h3>
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                        Menunggu Verifikasi
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        #{doc.id}
                      </span>
                      <span>•</span>
                      <span>{doc.timestamp}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {nomCount} nominatif
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <ReceiptText className="w-3 h-3" />
                        {formatRupiah(totalPiutang)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-center">
                    <span className="hidden sm:block text-sm font-semibold text-primary">Verifikasi</span>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {dokumenIndukList.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
              Tidak ada dokumen Non-PUPN yang menunggu verifikasi.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────── VIEW: DETAIL ───────────────────────────

  return (
    <div className="min-h-full bg-gray-50 pb-28">
      {/* TOPBAR */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wider">
              Verifikasi Non-PUPN
            </p>
            <h2 className="text-sm font-bold text-gray-800 truncate">{selectedDokumen?.judul}</h2>
          </div>
          {/* Progress */}
          <div className="hidden sm:flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
            <ClipboardCheck className="w-4 h-4 text-primary" />
            <div className="w-28 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(readyCount / totalNominatif) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {readyCount}/{totalNominatif}
            </span>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mx-5 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Validasi Gagal</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
          <button onClick={() => setError("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONTENT */}
      <div className="p-5 flex flex-col xl:flex-row gap-5 max-w-[1600px] mx-auto">
        {/* SIDEBAR DAFTAR NOMINATIF */}
        <div className="xl:w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-[80px]">
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700">Daftar Nominatif</span>
              </div>
            </div>
            <nav className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {nominatifList.map((nom: any, idx: number) => {
                const nomId = nom?.id ?? idx;
                const isActive = idx === activeNomIdx;
                const isChecked = Object.keys(checklist[nomId] || {}).length === DOKUMEN_OPSIONAL_NON_PUPN.length;
                const hasNomor = (nomorPPDTO[nomId] || "").trim() !== "";
                const isComplete = isChecked && hasNomor;
                return (
                  <button
                    key={nomId}
                    onClick={() => setActiveNomIdx(idx)}
                    className={`
                      w-full text-left px-4 py-3 transition
                      ${isActive ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-gray-50 border-l-2 border-transparent"}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`
                          w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                          ${isComplete ? "bg-emerald-100 text-emerald-700" : isChecked ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}
                        `}
                      >
                        {isComplete ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{nom.nama}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{formatRupiah(nom.nilaiPiutang)}</p>
                        {isChecked && !hasNomor && (
                          <p className="text-[10px] text-amber-600 mt-1">Belum ada nomor PPDTO</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* MAIN DETAIL NOMINATIF */}
        <div className="flex-1 min-w-0 space-y-5">
          {activeNominatif && (
            <>
              {/* INFO NOMINATIF */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-600 uppercase tracking-wider">
                      Nominatif {activeNomIdx + 1}
                    </p>
                    <p className="text-base font-bold text-gray-800">{activeNominatif.nama}</p>
                  </div>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoRow icon={<MapPin className="w-4 h-4" />} label="Alamat" value={activeNominatif.alamat || "—"} />
                  <InfoRow icon={<DollarSign className="w-4 h-4" />} label="Nilai Piutang" value={formatRupiah(activeNominatif.nilaiPiutang)} />
                  <InfoRow icon={<Calendar className="w-4 h-4" />} label="Tanggal Terjadi" value={formatTanggal(activeNominatif.tanggalTerjadi)} />
                  <InfoRow icon={<Calendar className="w-4 h-4" />} label="Jatuh Tempo / Macet" value={formatTanggal(activeNominatif.tanggalJatuhTempo)} />
                  <InfoRow icon={<CreditCard className="w-4 h-4" />} label="Mata Uang" value={activeNominatif.mataUang || "IDR"} />
                  <InfoRow icon={<ReceiptText className="w-4 h-4" />} label="Sisa Utang" value={formatRupiah(activeNominatif.sisaUtang)} />
                </div>

                {/* Daftar Pembayaran */}
                {activeNominatif.pembayaran && activeNominatif.pembayaran.length > 0 && (
                  <div className="px-5 pb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <ReceiptText className="w-4 h-4 text-primary" /> Riwayat Pembayaran
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border border-gray-100 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs text-gray-500">Tanggal</th>
                            <th className="px-3 py-2 text-right text-xs text-gray-500">Nilai</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeNominatif.pembayaran.map((p: Pembayaran, i: number) => (
                            <tr key={i} className="border-t border-gray-100">
                              <td className="px-3 py-2 text-xs">{formatTanggal(p.tanggal)}</td>
                              <td className="px-3 py-2 text-right text-xs">{formatRupiah(p.nilai)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Keterangan */}
                {activeNominatif.keterangan && (
                  <div className="px-5 pb-5">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Keterangan</p>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{activeNominatif.keterangan}</p>
                  </div>
                )}
              </div>

              {/* CHECKLIST DOKUMEN OPSIONAL */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-gray-700">Verifikasi Dokumen Opsional</span>
                  </div>
                  <ChecklistProgress nomId={activeNomId} checklist={checklist} />
                </div>

                <div className="p-5 space-y-3">
                  {DOKUMEN_OPSIONAL_NON_PUPN.map((doc, index) => {
                    const val = checklist[activeNomId]?.[doc.id];
                    const uploadedFile = activeNominatif.dokumen?.[doc.id] as File | null | undefined;
                    return (
                      <div
                        key={doc.id}
                        className={`
                          rounded-2xl border transition-all
                          ${val === "Sesuai" ? "bg-emerald-50 border-emerald-200" : ""}
                          ${val === "Tidak Sesuai" ? "bg-red-50 border-red-200" : ""}
                          ${!val ? "bg-white border-gray-100 hover:border-primary/20" : ""}
                        `}
                      >
                        <div className="p-4">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div
                                className={`
                                  w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                                  ${val === "Sesuai" ? "bg-emerald-500 text-white" : ""}
                                  ${val === "Tidak Sesuai" ? "bg-red-500 text-white" : ""}
                                  ${!val ? "bg-gray-100 text-gray-500" : ""}
                                `}
                              >
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-700">{doc.label}</p>
                                {uploadedFile && (
                                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                    <Paperclip className="w-3 h-3" /> {uploadedFile.name}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {uploadedFile && <PreviewFileButton file={uploadedFile} />}
                              <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                                <button
                                  onClick={() => handleChecklistChange(activeNomId, doc.id, "Sesuai")}
                                  className={`
                                    h-10 px-4 text-xs font-semibold transition-all
                                    ${val === "Sesuai" ? "bg-emerald-500 text-white" : "bg-white text-gray-600 hover:bg-emerald-50"}
                                  `}
                                >
                                  Sesuai
                                </button>
                                <button
                                  onClick={() => handleChecklistChange(activeNomId, doc.id, "Tidak Sesuai")}
                                  className={`
                                    h-10 px-4 text-xs font-semibold transition-all
                                    ${val === "Tidak Sesuai" ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:bg-red-50"}
                                  `}
                                >
                                  Tidak Sesuai
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Catatan jika Tidak Sesuai */}
                          {val === "Tidak Sesuai" && (
                            <div className="mt-4">
                              <textarea
                                rows={2}
                                value={keterangan[activeNomId] || ""}
                                onChange={(e) =>
                                  setKeterangan((prev) => ({ ...prev, [activeNomId]: e.target.value }))
                                }
                                placeholder="Tuliskan ketidaksesuaian dokumen..."
                                className="w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NOMOR PPDTO */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-gray-700">Nomor PPDTO</span>
                  <span className="text-red-500 text-xs font-bold">*</span>
                </div>
                <div className="p-5">
                  <input
                    type="text"
                    value={nomorPPDTO[activeNomId] || ""}
                    onChange={(e) => handleNomorPPDTOChange(activeNomId, e.target.value)}
                    placeholder="Contoh: PPDTO-001/KENDAL/2025"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Nomor PPDTO wajib diisi untuk setiap penanggung utang sebelum dapat dikirim ke Inspektorat.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* STICKY FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200">
        <div className="max-w-[1600px] mx-auto px-5 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Kiri: Progress ringkas */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClipboardCheck className="w-4 h-4 text-primary" />
                <span>
                  <strong className="text-gray-800">{readyCount}</strong> / {totalNominatif} nominatif siap kirim
                </span>
              </div>
              <div className="w-full sm:w-72 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: totalNominatif > 0 ? `${(readyCount / totalNominatif) * 100}%` : "0%" }}
                />
              </div>
            </div>

            {/* Kanan: Tombol Tolak & Terima */}
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleTolak}
                className="flex-1 sm:flex-none h-11 px-5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
              <button
                onClick={handleTerima}
                className="flex-1 sm:flex-none h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Terima & Kirim ke Inspektorat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Helper Component ───────────────────────────

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        {icon}
        <span className="text-[12px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-gray-700 leading-relaxed">{value}</p>
    </div>
  );
}