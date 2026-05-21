// components/contents/bpkad/VerifikasiPUPNContent.tsx
"use client";

import { useState } from "react";
import {
  ShieldCheck,
  FileText,
  UploadCloud,
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
  Trash2,
  Eye,
  CircleDot,
  CircleUser,
} from "lucide-react";

import { DokumenInduk } from "@/components/contents/skpd/PengajuanPenghapusanPiutangContent";
import { FormDataPUPN } from "@/components/modals/FormPenanggungUtangModal";

// ─────────────────────────── Types ───────────────────────────

export type VerifikasiPUPNData = {
  checklist: Record<
    number,
    Record<string, "Sesuai" | "Tidak Sesuai" | undefined>
  >;

  keterangan: Record<number, string>;

  globalKeterangan: string;

  fileBaPengkajian: File | null;

  namaFileBa: string;
};

interface VerifikasiPUPNContentProps {
  dokumenIndukList: DokumenInduk[];

  nominatifMap: Record<number, (FormDataPUPN | any)[]>;

  onTerima: (
    dokumenId: number,
    data: VerifikasiPUPNData
  ) => void;

  onTolak: (
    dokumenId: number,
    data: VerifikasiPUPNData,
    alasan: string
  ) => void;
}

// ─────────────────────────── Constants ───────────────────────────

const DOKUMEN_OPSIONAL_PUPN = [
  {
    id: "surat_kematian",
    label: "Surat Keterangan Kematian / Akte Kematian",
  },

  {
    id: "usaha_tidak_beroperasi",
    label: "Surat Usaha Tidak Beroperasi",
  },

  {
    id: "jaminan_tidak_cukup",
    label: "Surat Keterangan Jaminan Tidak Cukup",
  },

  {
    id: "keberadaan_tidak_diketahui",
    label:
      "Surat Keberadaan Penanggung Utang Tidak Diketahui",
  },

  {
    id: "tidak_mampu",
    label: "Surat Keterangan Tidak Mampu",
  },

  {
    id: "ahli_waris_tidak_mampu",
    label:
      "Surat Keterangan Ahli Waris/Penjamin Tidak Mampu",
  },
];

function fmt(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v);
}

// ─────────────────────────── Progress Badge ───────────────────────────

function ChecklistProgress({
  nomId,
  checklist,
}: {
  nomId: number;

  checklist: Record<
    number,
    Record<string, "Sesuai" | "Tidak Sesuai" | undefined>
  >;
}) {
  const entries = Object.values(checklist[nomId] || {});

  const sesuai = entries.filter(
    (v) => v === "Sesuai"
  ).length;

  const tidak = entries.filter(
    (v) => v === "Tidak Sesuai"
  ).length;

  const total = DOKUMEN_OPSIONAL_PUPN.length;

  if (entries.length === 0) {
    return (
      <span className="text-xs text-gray-600">
        Belum diperiksa
      </span>
    );
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

      <span className="text-[11px] text-gray-600">
        / {total}
      </span>
    </div>
  );
}

// ─────────────────────────── Main Component ───────────────────────────

export default function VerifikasiPUPNContent({
  dokumenIndukList,
  nominatifMap,
  onTerima,
  onTolak,
}: VerifikasiPUPNContentProps) {
  const [selectedDocId, setSelectedDocId] =
    useState<number | null>(null);

  const [activeNomIdx, setActiveNomIdx] =
    useState<number>(0);

  const [checklist, setChecklist] =
    useState<
      Record<
        number,
        Record<
          string,
          "Sesuai" | "Tidak Sesuai" | undefined
        >
      >
    >({});

  const [keterangan, setKeterangan] = useState<
    Record<number, string>
  >({});

  const [globalKeterangan, setGlobalKeterangan] =
    useState("");

  const [fileBa, setFileBa] =
    useState<File | null>(null);

  const [namaFileBa, setNamaFileBa] =
    useState("");

  const [error, setError] = useState("");

  const selectedDokumen = selectedDocId
    ? dokumenIndukList.find(
        (d) => d.id === selectedDocId
      )
    : null;

  const nominatifList = selectedDocId
    ? nominatifMap[selectedDocId] || []
    : [];

  const activeNominatif =
    nominatifList[activeNomIdx] ?? null;

  const activeNomId =
    (activeNominatif as any)?.id ?? activeNomIdx;

  // ─────────────────────────── Handlers ───────────────────────────

  const handleSelectDoc = (docId: number) => {
    setSelectedDocId(docId);

    setActiveNomIdx(0);

    setChecklist({});

    setKeterangan({});

    setGlobalKeterangan("");

    setFileBa(null);

    setNamaFileBa("");

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

        [docId]:
          prev[nomId]?.[docId] === value
            ? undefined
            : value,
      },
    }));

    // AUTO NEXT
    const updated = {
      ...(checklist[nomId] || {}),

      [docId]: value,
    };

    if (
      Object.keys(updated).length ===
        DOKUMEN_OPSIONAL_PUPN.length &&
      activeNomIdx < nominatifList.length - 1
    ) {
      setTimeout(() => {
        setActiveNomIdx((p) => p + 1);
      }, 300);
    }
  };

  const handleFileBaChange = (
    file: File | null
  ) => {
    if (
      file &&
      file.type !== "application/pdf"
    ) {
      alert("Hanya file PDF.");

      return;
    }

    setFileBa(file);

    setNamaFileBa(file ? file.name : "");
  };

  const validateTerima = () => {
    if (!fileBa) {
      setError(
        "Berita Acara Hasil Pengkajian wajib diunggah."
      );

      return false;
    }

    return true;
  };

  const buildData = (
    withFile: boolean
  ): VerifikasiPUPNData => ({
    checklist: { ...checklist },

    keterangan: { ...keterangan },

    globalKeterangan,

    fileBaPengkajian: withFile
      ? fileBa
      : null,

    namaFileBa: withFile
      ? namaFileBa
      : "",
  });

  const handleTerima = () => {
    if (
      !selectedDocId ||
      !validateTerima()
    )
      return;

    onTerima(
      selectedDocId,
      buildData(true)
    );

    setSelectedDocId(null);
  };

  const handleTolak = () => {
    if (!selectedDocId) return;

    if (!globalKeterangan.trim()) {
      setError(
        "Keterangan penolakan wajib diisi."
      );

      return;
    }

    onTolak(
      selectedDocId,
      buildData(false),
      globalKeterangan
    );

    setSelectedDocId(null);
  };

  // ─────────────────────────── Progress ───────────────────────────

  const totalNominatif =
    nominatifList.length;

  const totalChecked =
    nominatifList.filter(
      (_: any, i: number) => {
        const id =
          (nominatifList[i] as any)?.id ??
          i;

        return (
          Object.keys(
            checklist[id] || {}
          ).length > 0
        );
      }
    ).length;

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
                <h1 className="text-2xl font-bold text-gray-800">
                  Verifikasi PUPN
                </h1>

                <p className="text-sm text-gray-500">
                  Verifikasi pengajuan
                  penghapusan piutang jalur
                  PUPN
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-3xl font-bold text-primary">
              {dokumenIndukList.length}
            </p>

            <p className="text-xs text-gray-600 font-medium">
              Menunggu
            </p>
          </div>
        </div>

        {/* LIST */}

        <div className="space-y-4">
          {dokumenIndukList.map(
            (doc, idx) => {
              const nomCount =
                nominatifMap[doc.id]
                  ?.length ?? 0;

              const totalPiutang = (
                nominatifMap[doc.id] ||
                []
              ).reduce(
                (s: number, n: any) =>
                  s +
                  (n.pokok ?? 0) +
                  (n.denda ?? 0),
                0
              );

              return (
                <div
                  key={doc.id}
                  onClick={() =>
                    handleSelectDoc(doc.id)
                  }
                  className="group bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">
                      {idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-base">
                          {doc.judul}
                        </h3>

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

                        <span>
                          {doc.timestamp}
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {nomCount} nominatif
                        </span>

                        <span>•</span>

                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <ReceiptText className="w-3 h-3" />
                          {fmt(
                            totalPiutang
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-center">
                      <span className="hidden sm:block text-sm font-semibold text-primary">
                        Verifikasi
                      </span>

                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
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
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wider">
              Verifikasi PUPN
            </p>

            <h2 className="text-sm font-bold text-gray-800 truncate">
              {selectedDokumen?.judul}
            </h2>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <ClipboardCheck className="w-4 h-4 text-primary" />

            <div className="w-28 h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width:
                    totalNominatif > 0
                      ? `${
                          (totalChecked /
                            totalNominatif) *
                          100
                        }%`
                      : "0%",
                }}
              />
            </div>

            <span className="text-xs font-semibold text-gray-600">
              {totalChecked}/
              {totalNominatif}
            </span>
          </div>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mx-5 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />

          <div className="flex-1">
            <p className="font-semibold">
              Validasi Gagal
            </p>

            <p className="text-xs mt-1">
              {error}
            </p>
          </div>

          <button
            onClick={() =>
              setError("")
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONTENT */}

      <div className="p-5 flex flex-col xl:flex-row gap-5 max-w-[1600px] mx-auto">

        {/* SIDEBAR */}

        <div className="xl:w-72 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden sticky top-[80px]">
            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />

                <span className="text-sm font-semibold text-gray-700">
                  Daftar Penanggung Utang
                </span>
              </div>
            </div>

            <nav className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {nominatifList.map(
                (
                  nom: any,
                  idx: number
                ) => {
                  const nomId =
                    nom?.id ?? idx;

                  const isActive =
                    idx === activeNomIdx;

                  const entries =
                    Object.values(
                      checklist[
                        nomId
                      ] || {}
                    );

                  const sesuai =
                    entries.filter(
                      (v) =>
                        v ===
                        "Sesuai"
                    ).length;

                  const tidak =
                    entries.filter(
                      (v) =>
                        v ===
                        "Tidak Sesuai"
                    ).length;

                  const checked =
                    entries.length > 0;

                  return (
                    <button
                      key={nomId}
                      onClick={() =>
                        setActiveNomIdx(
                          idx
                        )
                      }
                      className={`
                        w-full text-left px-4 py-3 transition
                        ${
                          isActive
                            ? "bg-primary/5 border-l-2 border-primary"
                            : "hover:bg-gray-50 border-l-2 border-transparent"
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`
                            w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                            ${
                              isActive
                                ? "bg-primary text-white"
                                : checked
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-500"
                            }
                          `}
                        >
                          {checked ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-700 truncate">
                            {nom.nama}
                          </p>

                          <p className="text-xs text-gray-600 truncate mt-0.5">
                            {
                              nom.jenisPiutang
                            }
                          </p>

                          {checked && (
                            <div className="flex gap-1 mt-2">
                              {sesuai >
                                0 && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full">
                                  {
                                    sesuai
                                  }
                                  ✓
                                </span>
                              )}

                              {tidak >
                                0 && (
                                <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">
                                  {
                                    tidak
                                  }
                                  ✗
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </nav>
          </div>
        </div>

        {/* MAIN */}

        <div className="flex-1 min-w-0 space-y-5">

          {/* INFO NOMINATIF */}

          {activeNominatif && (
            <>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <CircleUser className="w-7 h-7 text-primary" /> 
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 tracking-wider">
                      Penanggung Utang Ke-
                      {activeNomIdx +
                        1}
                    </p>

                    <p className="text-base text-gray-800">
                      {
                        activeNominatif.nama
                      }
                    </p>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <InfoRow
                    icon={
                      <Hash className="w-4 h-4" />
                    }
                    label="NIK"
                    value={
                      activeNominatif.nik ||
                      "—"
                    }
                  />

                  <InfoRow
                    icon={
                      <MapPin className="w-4 h-4" />
                    }
                    label="Alamat"
                    value={
                      activeNominatif.alamat ||
                      "—"
                    }
                  />

                  <InfoRow
                    icon={
                      <Briefcase className="w-4 h-4" />
                    }
                    label="Pekerjaan"
                    value={
                      activeNominatif.pekerjaan ||
                      "—"
                    }
                  />

                  <InfoRow
                    icon={
                      <CircleDot className="w-4 h-4" />
                    }
                    label="Jenis Piutang"
                    value={
                      activeNominatif.jenisPiutang ||
                      "—"
                    }
                  />

                  <InfoRow
                    icon={
                      <ReceiptText className="w-4 h-4" />
                    }
                    label="No SKRD"
                    value={
                      activeNominatif.noSkrd ||
                      "—"
                    }
                  />

                  <InfoRow
                    icon={
                      <ReceiptText className="w-4 h-4" />
                    }
                    label="Total"
                    value={fmt(
                      (activeNominatif.pokok ??
                        0) +
                        (activeNominatif.denda ??
                          0)
                    )}
                  />
                </div>
              </div>

              {/* CHECKLIST */}

              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-burgundy-400">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-7 h-7 text-primary" />
                    <span className="font-semibold text-gray-700">
                      Kelengkapan
                      Dokumen
                    </span>
                  </div>

                  <ChecklistProgress
                    nomId={
                      activeNomId
                    }
                    checklist={
                      checklist
                    }
                  />
                </div>

                <div className="p-5 space-y-3">
                  {DOKUMEN_OPSIONAL_PUPN.map(
                    (
                      doc,
                      index
                    ) => {
                      const val =
                        checklist[
                          activeNomId
                        ]?.[
                          doc.id
                        ];

                      return (
                        <div
                          key={
                            doc.id
                          }
                          className={`
                            rounded-2xl border border-gray-300 transition-all
                            ${
                              val ===
                              "Sesuai"
                                ? "bg-emerald-50 border-emerald-200"
                                : val ===
                                  "Tidak Sesuai"
                                ? "bg-red-50 border-red-200"
                                : "bg-white border-gray-100 hover:border-primary/20"
                            }
                          `}
                        >
                          <div className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">

                              {/* LEFT */}

                              <div className="flex items-start gap-3 flex-1">
                                <div
                                  className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0
                                    ${
                                      val ===
                                      "Sesuai"
                                        ? "bg-emerald-500 text-white"
                                        : val ===
                                          "Tidak Sesuai"
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-100 text-gray-500"
                                    }
                                  `}
                                >
                                  {index +
                                    1}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                                    {
                                      doc.label
                                    }
                                  </p>

                                  <p className="text-xs text-gray-600 mt-1">
                                    Verifikasi
                                    kesesuaian
                                    dokumen
                                  </p>
                                </div>
                              </div>

                              {/* RIGHT */}

                              <div className="flex items-center gap-2 flex-shrink-0">

                                {/* Preview */}

                                <button
                                  className="w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center"
                                  title="Preview"
                                >
                                  <Eye className="w-4 h-4 text-gray-500" />
                                </button>

                                {/* Segmented */}

                                <div className="flex rounded-lg overflow-hidden border border-gray-200 shadow-sm">

                                  <button
                                    onClick={() =>
                                      handleChecklistChange(
                                        activeNomId,
                                        doc.id,
                                        "Sesuai"
                                      )
                                    }
                                    className={`
                                      h-10 px-4 text-xs font-semibold transition-all
                                      ${
                                        val ===
                                        "Sesuai"
                                          ? "bg-emerald-500 text-white"
                                          : "bg-white text-gray-600 hover:bg-emerald-50"
                                      }
                                    `}
                                  >
                                    Sesuai
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleChecklistChange(
                                        activeNomId,
                                        doc.id,
                                        "Tidak Sesuai"
                                      )
                                    }
                                    className={`
                                      h-10 px-4 text-xs font-semibold transition-all
                                      ${
                                        val ===
                                        "Tidak Sesuai"
                                          ? "bg-red-500 text-white"
                                          : "bg-white text-gray-600 hover:bg-red-50"
                                      }
                                    `}
                                  >
                                    Tidak
                                    Sesuai
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* CATATAN */}

                            {val ===
                              "Tidak Sesuai" && (
                              <div className="mt-4">
                                <textarea
                                  rows={
                                    3
                                  }
                                  value={
                                    keterangan[
                                      activeNomId
                                    ] ||
                                    ""
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    setKeterangan(
                                      (
                                        prev
                                      ) => ({
                                        ...prev,

                                        [activeNomId]:
                                          e
                                            .target
                                            .value,
                                      })
                                    )
                                  }
                                  placeholder="Tuliskan ketidaksesuaian..."
                                  className="w-full rounded-lg border border-red-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 transition"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* FILE */}

              <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                  <Paperclip className="w-7 h-7 text-primary" />

                  <span className="text-sm font-semibold text-gray-700">
                    Upload BA Hasil
                    Pengkajian
                  </span>

                  <span className="text-red-500 text-xs font-bold">
                    *
                  </span>
                </div>

                <div className="p-5">
                  <label className="border-2 border-dashed border-gray-200 hover:border-primary/40 transition rounded-2xl bg-gray-50 p-8 flex flex-col items-center justify-center text-center cursor-pointer">
                    <UploadCloud className="w-8 h-8 text-primary mb-3" />

                    <p className="text-sm font-semibold text-gray-700">
                      Klik atau drag
                      PDF ke sini
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                      Format PDF
                    </p>

                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(
                        e
                      ) =>
                        handleFileBaChange(
                          e
                            .target
                            .files?.[0] ??
                            null
                        )
                      }
                    />
                  </label>

                  {namaFileBa && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mt-3 text-xs text-emerald-800">
                      <span className="flex items-center gap-2 truncate font-medium">
                        <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />

                        {
                          namaFileBa
                        }
                      </span>

                      <button
                        onClick={() =>
                          handleFileBaChange(
                            null
                          )
                        }
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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

            {/* LEFT */}

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ClipboardCheck className="w-4 h-4 text-primary" />

                <span>
                  <strong className="text-gray-800">
                    {
                      totalChecked
                    }
                  </strong>
                  /
                  {
                    totalNominatif
                  }{" "}
                  nominatif
                  diperiksa
                </span>

                {fileBa && (
                  <>
                    <span className="text-gray-300">
                      •
                    </span>

                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      BA
                      terlampir
                    </span>
                  </>
                )}
              </div>

              <div className="w-full sm:w-72 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width:
                      totalNominatif >
                      0
                        ? `${
                            (totalChecked /
                              totalNominatif) *
                            100
                          }%`
                        : "0%",
                  }}
                />
              </div>
            </div>

            {/* RIGHT */}

            <div className="flex gap-2 w-full sm:w-auto">

              <button
                onClick={
                  handleTolak
                }
                className="flex-1 sm:flex-none h-11 px-5 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />

                Tolak
              </button>

              <button
                onClick={
                  handleTerima
                }
                className="flex-1 sm:flex-none h-11 px-6 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />

                Terima &
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Helper Components ───────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        {icon}
        
        <span className="text-[12px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-700 leading-relaxed">
        {value}
      </p>
    </div>
  );
}