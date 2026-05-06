"use client";

import { useState, useEffect } from "react";
import {
  X,
  User,
  MapPin,
  CreditCard,
  Briefcase,
  FileText,
  AlertCircle,
  Calendar,
  DollarSign,
  Info,
  Paperclip,
  UploadCloud,
  Trash2,
  Eye,
} from "lucide-react";

type Jalur = "PUPN" | "NON-PUPN";

// Tipe data untuk PUPN
export type FormDataPUPN = {
  nama: string;
  alamat: string;
  nik: string;
  pekerjaan: string;
  jenisPiutang: string;
  noSkrd: string;
  noStrd: string;
  pokok: number;
  denda: number;
  upayaPenagihan: string;
  dokumen: Record<string, File | null>;
};

// Tipe data untuk NON-PUPN
export type FormDataNonPUPN = {
  nama: string;
  alamat: string;
  nilaiPiutang: number;
  tanggalTerjadi: string;
  tanggalJatuhTempo: string;
  mataUang: string;
  keterangan: string;
  dokumen: Record<string, File | null>;
};

interface FormPenanggungUtangModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  jalur: Jalur;
  initialData?: FormDataPUPN | FormDataNonPUPN | null;
}

const jenisPiutangOptions = [
  "Retribusi Daerah",
  "Piutang Daerah Lainnya",
  "Piutang BLUD",
  "Tuntutan Perbendaharaan (TP)",
  "Tuntutan Ganti Rugi (TGR)",
];

// Konfigurasi daftar dokumen untuk masing-masing jalur
const DOKUMEN_PUPN = {
  wajib: [
    {
      id: "ba_lapangan",
      label: "Berita Acara (BA) Identifikasi Lapangan",
      keterangan: "Wajib diunggah (PDF), disahkan oleh Kepala SKPD",
    },
  ],
  opsional: [
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
      label: "Surat Keberadaan Penanggung Utang Tidak Diketahui",
    },
    {
      id: "tidak_mampu",
      label: "Surat Keterangan Tidak Mampu",
    },
    {
      id: "ahli_waris_tidak_mampu",
      label: "Surat Keterangan Ahli Waris/Penjamin Tidak Mampu",
    },
  ],
};

const DOKUMEN_NON_PUPN = {
  wajib: [
    {
      id: "surat_tagihan",
      label: "Surat Tagihan (Bukti Penagihan Tertulis)",
      keterangan: "Wajib diunggah (PDF)",
    },
  ],
  wajibKondisional: (nilaiPiutang: number) =>
    nilaiPiutang > 1_000_000_000
      ? [
          {
            id: "kerjasama_djkn",
            label:
              "Bukti Kerjasama dengan Kanwil DJKN Perwakilan Jawa Tengah",
            keterangan:
              "Wajib karena nilai piutang > Rp 1 Miliar (PDF)",
          },
        ]
      : [],
  opsional: [
    {
      id: "optimalisasi_lainnya",
      label: "Dokumen Bukti Optimalisasi Lainnya (MoU, Gugatan, dll.)",
    },
    {
      id: "kk_miskin",
      label: "Kartu Keluarga Miskin",
    },
    {
      id: "putusan_pailit",
      label: "Putusan Pailit",
    },
    {
      id: "surat_lurah",
      label: "Surat Keterangan dari Lurah",
    },
    {
      id: "bansos",
      label:
        "Bukti Penerimaan Bansos/Asuransi Kesehatan Miskin",
    },
    {
      id: "kunjungan_ppkd",
      label: "Bukti Kunjungan Penagihan oleh Petugas PPKD",
    },
  ],
};

export default function FormPenanggungUtangModal({
  isOpen,
  onClose,
  onSubmit,
  jalur,
  initialData,
}: FormPenanggungUtangModalProps) {
  // State untuk PUPN
  const [formPUPN, setFormPUPN] = useState<FormDataPUPN>({
    nama: "",
    alamat: "",
    nik: "",
    pekerjaan: "",
    jenisPiutang: "Retribusi Daerah",
    noSkrd: "",
    noStrd: "",
    pokok: 0,
    denda: 0,
    upayaPenagihan: "",
    dokumen: {},
  });

  // State untuk NON-PUPN
  const [formNonPUPN, setFormNonPUPN] = useState<FormDataNonPUPN>({
    nama: "",
    alamat: "",
    nilaiPiutang: 0,
    tanggalTerjadi: "",
    tanggalJatuhTempo: "",
    mataUang: "IDR",
    keterangan: "",
    dokumen: {},
  });

  // State untuk file yang dipilih (dict) dan nama file
  const [dokumenFiles, setDokumenFiles] = useState<Record<string, File | null>>({});
  const [dokumenNama, setDokumenNama] = useState<Record<string, string>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form saat modal dibuka atau jalur berubah
  useEffect(() => {
    if (isOpen) {
      // Reset dokumen
      setDokumenFiles({});
      setDokumenNama({});

      if (jalur === "PUPN") {
        if (initialData && "nik" in initialData) {
          const data = initialData as FormDataPUPN;
          setFormPUPN(data);
          if (data.dokumen) {
            const files: Record<string, File | null> = {};
            const names: Record<string, string> = {};
            Object.entries(data.dokumen).forEach(([key, val]) => {
              files[key] = val;
              names[key] = val?.name || "File tersimpan";
            });
            setDokumenFiles(files);
            setDokumenNama(names);
          }
        } else {
          setFormPUPN({
            nama: "",
            alamat: "",
            nik: "",
            pekerjaan: "",
            jenisPiutang: "Retribusi Daerah",
            noSkrd: "",
            noStrd: "",
            pokok: 0,
            denda: 0,
            upayaPenagihan: "",
            dokumen: {},
          });
        }
      } else {
        if (initialData && "nilaiPiutang" in initialData) {
          const data = initialData as FormDataNonPUPN;
          setFormNonPUPN(data);
          if (data.dokumen) {
            const files: Record<string, File | null> = {};
            const names: Record<string, string> = {};
            Object.entries(data.dokumen).forEach(([key, val]) => {
              files[key] = val;
              names[key] = val?.name || "File tersimpan";
            });
            setDokumenFiles(files);
            setDokumenNama(names);
          }
        } else {
          setFormNonPUPN({
            nama: "",
            alamat: "",
            nilaiPiutang: 0,
            tanggalTerjadi: "",
            tanggalJatuhTempo: "",
            mataUang: "IDR",
            keterangan: "",
            dokumen: {},
          });
        }
      }
      setErrors({});
    }
  }, [isOpen, jalur, initialData]);

  // Handle perubahan file
  const handleFileChange = (id: string, file: File | null) => {
    // Hanya terima PDF
    if (file && file.type !== "application/pdf") {
      alert("Hanya file PDF yang diperbolehkan.");
      return;
    }
    const newFiles = { ...dokumenFiles, [id]: file };
    const newNames = { ...dokumenNama, [id]: file ? file.name : "" };
    setDokumenFiles(newFiles);
    setDokumenNama(newNames);
    // Bersihkan error dokumen jika ada
    if (errors.dokumen) {
      setErrors((prev) => ({ ...prev, dokumen: "" }));
    }
  };

  // Hapus file yang sudah dipilih
  const handleRemoveFile = (id: string) => {
    const newFiles = { ...dokumenFiles, [id]: null };
    const newNames = { ...dokumenNama, [id]: "" };
    setDokumenFiles(newFiles);
    setDokumenNama(newNames);
  };

  // Pratinjau PDF di tab baru
  const handlePreviewFile = (id: string) => {
    const file = dokumenFiles[id];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, "_blank");
    }
  };

  const validateFormPUPN = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formPUPN.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formPUPN.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    if (formPUPN.nik && !/^\d{16}$/.test(formPUPN.nik))
      newErrors.nik = "NIK harus 16 digit angka";

    // Validasi dokumen wajib PUPN
    if (!dokumenFiles["ba_lapangan"]) {
      newErrors.dokumen =
        "Berita Acara (BA) Identifikasi Lapangan wajib diunggah (PDF).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFormNonPUPN = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formNonPUPN.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formNonPUPN.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    if (formNonPUPN.nilaiPiutang <= 0)
      newErrors.nilaiPiutang = "Nilai piutang harus lebih dari 0";

    // Validasi dokumen wajib Non-PUPN
    if (!dokumenFiles["surat_tagihan"]) {
      newErrors.dokumen =
        "Surat Tagihan (Bukti Penagihan Tertulis) wajib diunggah (PDF).";
    }

    // Jika nilai piutang > 1 miliar, kerjasama DJKN wajib
    if (formNonPUPN.nilaiPiutang > 1_000_000_000) {
      if (!dokumenFiles["kerjasama_djkn"]) {
        newErrors.dokumen =
          "Bukti Kerjasama dengan Kanwil DJKN wajib diunggah (PDF) karena nilai piutang > Rp 1 Miliar.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jalur === "PUPN") {
      if (validateFormPUPN()) {
        const data = { ...formPUPN, dokumen: dokumenFiles };
        onSubmit(data);
      }
    } else {
      if (validateFormNonPUPN()) {
        const data = { ...formNonPUPN, dokumen: dokumenFiles };
        onSubmit(data);
      }
    }
  };

  const totalPiutang =
    jalur === "PUPN" ? formPUPN.pokok + formPUPN.denda : formNonPUPN.nilaiPiutang;

  if (!isOpen) return null;

  // Komponen kecil untuk upload file
  const DokumenField = ({
    id,
    label,
    required,
    keterangan,
  }: {
    id: string;
    label: string;
    required?: boolean;
    keterangan?: string;
  }) => {
    const file = dokumenFiles[id];
    const fileName = dokumenNama[id];
    return (
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(id, e.target.files[0]);
              }
            }}
            className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100 transition ${
              !file
                ? "border-dashed border-2 border-gray-300 bg-gray-50"
                : "border border-gray-200"
            } rounded-lg py-1`}
          />
          {!file && (
            <UploadCloud className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />
          )}
        </div>
        {file && fileName && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-1 mt-1 text-xs text-green-800">
            <span className="flex items-center gap-1 truncate">
              <Paperclip className="w-3 h-3" /> {fileName}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePreviewFile(id)}
                className="text-primary hover:text-primary-dark p-1"
                title="Pratinjau PDF"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleRemoveFile(id)}
                className="text-red-500 hover:text-red-700 p-1"
                title="Hapus file"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {keterangan && (
          <p className="text-xs text-gray-400 mt-1">{keterangan}</p>
        )}
      </div>
    );
  };

  // Daftar dokumen yang akan ditampilkan
  const dokumenWajibPUPN = DOKUMEN_PUPN.wajib;
  const dokumenOpsionalPUPN = DOKUMEN_PUPN.opsional;

  const dokumenWajibNonPUPN = DOKUMEN_NON_PUPN.wajib;
  const dokumenKondisional = DOKUMEN_NON_PUPN.wajibKondisional(
    formNonPUPN.nilaiPiutang
  );
  const dokumenOpsionalNonPUPN = DOKUMEN_NON_PUPN.opsional;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-800">
              {initialData ? "Edit Penanggung Utang" : "Tambah Penanggung Utang"}
            </h2>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                jalur === "PUPN"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {jalur === "PUPN" ? "Jalur PUPN (PSBDT)" : "Jalur Non-PUPN (PPDTO)"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* ================= DATA UTAMA ================= */}
          {jalur === "PUPN" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formPUPN.nama}
                      onChange={(e) =>
                        setFormPUPN({ ...formPUPN, nama: e.target.value })
                      }
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                        errors.nama ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.nama && (
                    <p className="text-xs text-red-500 mt-1">{errors.nama}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formPUPN.alamat}
                      onChange={(e) =>
                        setFormPUPN({ ...formPUPN, alamat: e.target.value })
                      }
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                        errors.alamat ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {errors.alamat && (
                    <p className="text-xs text-red-500 mt-1">{errors.alamat}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIK
                  </label>
                  <input
                    type="text"
                    value={formPUPN.nik}
                    onChange={(e) =>
                      setFormPUPN({ ...formPUPN, nik: e.target.value })
                    }
                    maxLength={16}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary ${
                      errors.nik ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.nik && (
                    <p className="text-xs text-red-500 mt-1">{errors.nik}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pekerjaan
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formPUPN.pekerjaan}
                      onChange={(e) =>
                        setFormPUPN({ ...formPUPN, pekerjaan: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Piutang
                  </label>
                  <select
                    value={formPUPN.jenisPiutang}
                    onChange={(e) =>
                      setFormPUPN({ ...formPUPN, jenisPiutang: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-white"
                  >
                    {jenisPiutangOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. SKRD
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formPUPN.noSkrd}
                      onChange={(e) =>
                        setFormPUPN({ ...formPUPN, noSkrd: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    No. STRD
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formPUPN.noStrd}
                      onChange={(e) =>
                        setFormPUPN({ ...formPUPN, noStrd: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pokok Piutang (Rp)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={formPUPN.pokok || ""}
                      onChange={(e) =>
                        setFormPUPN({
                          ...formPUPN,
                          pokok: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Denda (Rp)
                  </label>
                  <input
                    type="number"
                    value={formPUPN.denda || ""}
                    onChange={(e) =>
                      setFormPUPN({
                        ...formPUPN,
                        denda: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Piutang
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={new Intl.NumberFormat("id-ID").format(totalPiutang)}
                      readOnly
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-primary"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upaya Penagihan
                </label>
                <textarea
                  rows={2}
                  value={formPUPN.upayaPenagihan}
                  onChange={(e) =>
                    setFormPUPN({ ...formPUPN, upayaPenagihan: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Surat teguran, mediasi, dll."
                ></textarea>
              </div>
            </>
          ) : (
            // ================= FORM JALUR NON-PUPN =================
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNonPUPN.nama}
                    onChange={(e) =>
                      setFormNonPUPN({ ...formNonPUPN, nama: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.nama ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.nama && (
                    <p className="text-xs text-red-500 mt-1">{errors.nama}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNonPUPN.alamat}
                    onChange={(e) =>
                      setFormNonPUPN({ ...formNonPUPN, alamat: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.alamat ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.alamat && (
                    <p className="text-xs text-red-500 mt-1">{errors.alamat}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai Piutang (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formNonPUPN.nilaiPiutang || ""}
                    onChange={(e) =>
                      setFormNonPUPN({
                        ...formNonPUPN,
                        nilaiPiutang: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.nilaiPiutang ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.nilaiPiutang && (
                    <p className="text-xs text-red-500 mt-1">{errors.nilaiPiutang}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Terjadi Piutang
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formNonPUPN.tanggalTerjadi}
                      onChange={(e) =>
                        setFormNonPUPN({
                          ...formNonPUPN,
                          tanggalTerjadi: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jatuh Tempo / Macet
                  </label>
                  <input
                    type="date"
                    value={formNonPUPN.tanggalJatuhTempo}
                    onChange={(e) =>
                      setFormNonPUPN({
                        ...formNonPUPN,
                        tanggalJatuhTempo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mata Uang
                  </label>
                  <input
                    type="text"
                    value={formNonPUPN.mataUang}
                    onChange={(e) =>
                      setFormNonPUPN({
                        ...formNonPUPN,
                        mataUang: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  value={formNonPUPN.keterangan}
                  onChange={(e) =>
                    setFormNonPUPN({
                      ...formNonPUPN,
                      keterangan: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Keberadaan penanggung utang, kemampuan bayar, kondisi jaminan, dll."
                ></textarea>
              </div>

              {/* Info syarat umur piutang sesuai Perbup Lampiran II E */}
              <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 flex gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Persyaratan usia piutang (Lampiran II E):
                  </p>
                  <ul className="list-disc list-inside mt-1">
                    <li>≤ Rp8 juta → usia &gt; 5 tahun</li>
                    <li>Rp8 juta - Rp50 juta → usia &gt; 7 tahun</li>
                    <li>Rp50 juta - Rp1 Miliar → usia &gt; 10 tahun</li>
                    <li>&gt; Rp1 Miliar → usia &gt; 10 tahun + kerjasama dengan Kanwil DJKN</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* ================= DOKUMEN & LAMPIRAN ================= */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2 mb-1">
              <Paperclip className="w-5 h-5 text-primary" /> Dokumen Persyaratan
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {jalur === "PUPN"
                ? "Unggah dokumen pendukung dalam format PDF. Berita Acara Lapangan wajib diisi."
                : "Unggah dokumen pendukung dalam format PDF. Surat Tagihan wajib diisi. Kerjasama DJKN wajib jika piutang > 1 M."}
            </p>

            {/* Error dokumen global */}
            {errors.dokumen && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.dokumen}</span>
              </div>
            )}

            {jalur === "PUPN" ? (
              <>
                {/* DOKUMEN WAJIB PUPN */}
                {dokumenWajibPUPN.map((doc) => (
                  <DokumenField
                    key={doc.id}
                    id={doc.id}
                    label={doc.label}
                    required
                    keterangan={doc.keterangan}
                  />
                ))}
                {/* DOKUMEN OPSIONAL PUPN */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Dokumen Opsional Lainnya
                  </h4>
                  {dokumenOpsionalPUPN.map((doc) => (
                    <DokumenField key={doc.id} id={doc.id} label={doc.label} />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* DOKUMEN WAJIB NON-PUPN */}
                {dokumenWajibNonPUPN.map((doc) => (
                  <DokumenField
                    key={doc.id}
                    id={doc.id}
                    label={doc.label}
                    required
                    keterangan={doc.keterangan}
                  />
                ))}

                {/* DOKUMEN KONDISIONAL (KERJASAMA DJKN) */}
                {dokumenKondisional.map((doc) => (
                  <DokumenField
                    key={doc.id}
                    id={doc.id}
                    label={doc.label}
                    required
                    keterangan={doc.keterangan}
                  />
                ))}

                {/* DOKUMEN OPSIONAL NON-PUPN */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Dokumen Opsional Lainnya
                  </h4>
                  {dokumenOpsionalNonPUPN.map((doc) => (
                    <DokumenField key={doc.id} id={doc.id} label={doc.label} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
            >
              <User className="w-4 h-4" />{" "}
              {initialData ? "Simpan Perubahan" : "Simpan Penanggung Utang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}