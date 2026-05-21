"use client";

import { useState, useEffect, useRef } from "react";
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
  Plus,
  ChevronDown,
  Search,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import cc from "currency-codes";

// ---- Daftar mata uang ISO 4217 (currency-codes) ----
const PRIORITY_CODES = ["IDR","USD","EUR","SGD","MYR","JPY","CNY","GBP","AUD","SAR","AED"];
const ALL_CURRENCY_CODES = [
  ...PRIORITY_CODES,
  ...cc.codes().filter((c) => !PRIORITY_CODES.includes(c)),
];
const CURRENCY_OPTIONS = ALL_CURRENCY_CODES.map((code) => {
  const info = cc.code(code);
  return { code, name: info ? info.currency : code };
});

// ---- Format angka → "1.500.000" (pemisah ribuan, tanpa Rp) ----
function formatThousands(raw: string | number): string {
  const digits = String(raw).replace(/\D/g, "");
  if (!digits || digits === "0") return "";
  return Number(digits).toLocaleString("id-ID");
}
function parseFormatted(formatted: string): number {
  return parseInt(formatted.replace(/\./g, "").replace(/,/g, "")) || 0;
}

// ---- CurrencySelect Component ----
function CurrencySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = CURRENCY_OPTIONS.filter(
    (c) =>
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      c.name.toLowerCase().includes(query.toLowerCase())
  );

  const selected = CURRENCY_OPTIONS.find((c) => c.code === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen((p) => !p); setQuery(""); }}
        className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
      >
        <span className="inline-flex items-center justify-center w-8 h-5 rounded bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
          {selected?.code ?? "—"}
        </span>
        <span className="flex-1 text-left text-gray-700 truncate">
          {selected ? `${selected.code} – ${selected.name}` : "Pilih mata uang"}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kode atau nama mata uang..."
              className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          {/* Priority label */}
          {!query && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50 border-b border-gray-100">
              Umum digunakan
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {!query && (
              <>
                {PRIORITY_CODES.map((code) => {
                  const item = CURRENCY_OPTIONS.find((c) => c.code === code)!;
                  const isActive = value === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => { onChange(code); setOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition ${isActive ? "bg-primary/5 text-primary" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      <span className={`inline-flex items-center justify-center w-9 h-5 rounded text-[11px] font-bold flex-shrink-0 ${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                        {code}
                      </span>
                      <span className="flex-1 truncate">{item.name}</span>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
                <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest bg-gray-50 border-y border-gray-100">
                  Semua mata uang
                </div>
              </>
            )}
            {(query ? filtered : CURRENCY_OPTIONS.filter((c) => !PRIORITY_CODES.includes(c.code))).map((item) => {
              const isActive = value === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => { onChange(item.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition ${isActive ? "bg-primary/5 text-primary" : "hover:bg-gray-50 text-gray-700"}`}
                >
                  <span className={`inline-flex items-center justify-center w-9 h-5 rounded text-[11px] font-bold flex-shrink-0 ${isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                    {item.code}
                  </span>
                  <span className="flex-1 truncate">{item.name}</span>
                  {isActive && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />}
                </button>
              );
            })}
            {query && filtered.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-gray-400">Tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- RupiahInput Component ----
function RupiahInput({
  value,
  onChange,
  placeholder = "0",
  error,
  className = "",
}: {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value > 0 ? formatThousands(value) : "");

  // Sync ketika value dari luar berubah (misal reset form)
  useEffect(() => {
    setDisplayValue(value > 0 ? formatThousands(value) : "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\./g, "").replace(/,/g, "");
    const digits = raw.replace(/\D/g, "");
    const num = parseInt(digits) || 0;
    setDisplayValue(digits ? Number(digits).toLocaleString("id-ID") : "");
    onChange(num);
  };

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none select-none">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full pl-9 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm ${
          error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
        }`}
      />
    </div>
  );
}

type Jalur = "PUPN" | "NON-PUPN";

export type Pembayaran = {
  id: number;
  tanggal: string;
  nilai: number;
};

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

export type FormDataNonPUPN = {
  nama: string;
  alamat: string;
  nilaiPiutang: number;
  tanggalTerjadi: string;
  tanggalJatuhTempo: string;
  mataUang: string;
  pembayaran: Pembayaran[];
  saldoUtang: number;
  sisaUtang: number;
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

const DOKUMEN_PUPN = {
  wajib: [
    {
      id: "ba_lapangan",
      label: "Berita Acara (BA) Identifikasi Lapangan",
      keterangan: "Wajib diunggah (PDF) – Berita Acara identifikasi lapangan dari tim identifikasi lapangan yang telah disahkan oleh kepala PPKD.",
    },
  ],
  opsional: [
    { id: "surat_kematian", label: "Surat Keterangan Kematian / Akte Kematian" },
    { id: "usaha_tidak_beroperasi", label: "Surat Usaha Tidak Beroperasi" },
    { id: "jaminan_tidak_cukup", label: "Surat Keterangan Jaminan Tidak Cukup" },
    { id: "keberadaan_tidak_diketahui", label: "Surat Keberadaan Penanggung Utang Tidak Diketahui" },
    { id: "tidak_mampu", label: "Surat Keterangan Tidak Mampu" },
    { id: "ahli_waris_tidak_mampu", label: "Surat Keterangan Ahli Waris/Penjamin Tidak Mampu" },
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
  wajibKondisional: (_nilaiPiutang: number, sisaUtang: number) =>
    sisaUtang > 1_000_000_000
      ? [{ id: "kerjasama_djkn", label: "Bukti Kerjasama dengan Kanwil DJKN Perwakilan Jawa Tengah", keterangan: "Wajib karena sisa utang > Rp 1 Miliar (PDF)" }]
      : [],
  opsional: [
    { id: "optimalisasi_lainnya", label: "Dokumen Bukti Optimalisasi Lainnya (MoU, Gugatan, dll.)" },
    { id: "kk_miskin", label: "Kartu Keluarga Miskin" },
    { id: "putusan_pailit", label: "Putusan Pailit" },
    { id: "surat_lurah", label: "Surat Keterangan dari Lurah" },
    { id: "bansos", label: "Bukti Penerimaan Bansos/Asuransi Kesehatan Miskin" },
    { id: "kunjungan_ppkd", label: "Bukti Kunjungan Penagihan oleh Petugas PPKD" },
  ],
};

export default function FormPenanggungUtangModal({
  isOpen,
  onClose,
  onSubmit,
  jalur,
  initialData,
}: FormPenanggungUtangModalProps) {
  const [formPUPN, setFormPUPN] = useState<FormDataPUPN>({
    nama: "", alamat: "", nik: "", pekerjaan: "", jenisPiutang: "Retribusi Daerah",
    noSkrd: "", noStrd: "", pokok: 0, denda: 0, upayaPenagihan: "", dokumen: {},
  });

  const [formNonPUPN, setFormNonPUPN] = useState<FormDataNonPUPN>({
    nama: "", alamat: "", nilaiPiutang: 0, tanggalTerjadi: "", tanggalJatuhTempo: "",
    mataUang: "IDR", pembayaran: [], saldoUtang: 0, sisaUtang: 0, keterangan: "", dokumen: {},
  });

  const [dokumenFiles, setDokumenFiles] = useState<Record<string, File | null>>({});
  const [dokumenNama, setDokumenNama] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDokumenFiles({});
      setDokumenNama({});
      if (jalur === "PUPN") {
        if (initialData && "nik" in initialData) {
          const data = initialData as FormDataPUPN;
          setFormPUPN(data);
          if (data.dokumen) restoreDokumen(data.dokumen);
        } else {
          setFormPUPN({ nama: "", alamat: "", nik: "", pekerjaan: "", jenisPiutang: "Retribusi Daerah", noSkrd: "", noStrd: "", pokok: 0, denda: 0, upayaPenagihan: "", dokumen: {} });
        }
      } else {
        if (initialData && "nilaiPiutang" in initialData) {
          const data = initialData as FormDataNonPUPN;
          setFormNonPUPN({ ...data, pembayaran: data.pembayaran || [], saldoUtang: data.saldoUtang ?? data.nilaiPiutang, sisaUtang: data.sisaUtang ?? data.nilaiPiutang });
          if (data.dokumen) restoreDokumen(data.dokumen);
        } else {
          setFormNonPUPN({ nama: "", alamat: "", nilaiPiutang: 0, tanggalTerjadi: "", tanggalJatuhTempo: "", mataUang: "IDR", pembayaran: [], saldoUtang: 0, sisaUtang: 0, keterangan: "", dokumen: {} });
        }
      }
      setErrors({});
    }
  }, [isOpen, jalur, initialData]);

  const restoreDokumen = (dict: Record<string, File | null>) => {
    const files: Record<string, File | null> = {};
    const names: Record<string, string> = {};
    Object.entries(dict).forEach(([key, val]) => { files[key] = val; names[key] = val?.name || "File tersimpan"; });
    setDokumenFiles(files);
    setDokumenNama(names);
  };

  const handleFileChange = (id: string, file: File | null) => {
    if (file && file.type !== "application/pdf") { alert("Hanya file PDF yang diperbolehkan."); return; }
    setDokumenFiles((prev) => ({ ...prev, [id]: file }));
    setDokumenNama((prev) => ({ ...prev, [id]: file ? file.name : "" }));
    if (errors.dokumen) setErrors((prev) => ({ ...prev, dokumen: "" }));
  };

  const handleRemoveFile = (id: string) => {
    setDokumenFiles((prev) => ({ ...prev, [id]: null }));
    setDokumenNama((prev) => ({ ...prev, [id]: "" }));
  };

  const handlePreviewFile = (id: string) => {
    const file = dokumenFiles[id];
    if (file) window.open(URL.createObjectURL(file), "_blank");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Kalkulasi Non-PUPN
  const totalPembayaran = formNonPUPN.pembayaran.reduce((sum, p) => sum + (p.nilai || 0), 0);
  const saldoUtang = Math.max(0, formNonPUPN.nilaiPiutang - totalPembayaran);
  const sisaUtang = saldoUtang;

  const getUsiaWarning = () => {
    if (!formNonPUPN.tanggalJatuhTempo) return null;
    const jatuh = new Date(formNonPUPN.tanggalJatuhTempo);
    const now = new Date();
    const diffYears = (now.getTime() - jatuh.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (sisaUtang <= 8_000_000 && diffYears < 5) return "Usia piutang harus > 5 tahun untuk ≤ Rp8 juta";
    if (sisaUtang > 8_000_000 && sisaUtang <= 50_000_000 && diffYears < 7) return "Usia piutang harus > 7 tahun untuk Rp8–50 juta";
    if (sisaUtang > 50_000_000 && sisaUtang <= 1_000_000_000 && diffYears < 10) return "Usia piutang harus > 10 tahun untuk Rp50–1 M";
    if (sisaUtang > 1_000_000_000) {
      if (diffYears < 10) return "Usia piutang harus > 10 tahun untuk > Rp1 M";
      if (!dokumenFiles["kerjasama_djkn"]) return "Kerjasama dengan Kanwil DJKN wajib diunggah";
    }
    return null;
  };
  const usiaWarning = getUsiaWarning();

  // Pembayaran handlers
  const addPembayaran = () => {
    setFormNonPUPN((prev) => ({ ...prev, pembayaran: [...prev.pembayaran, { id: Date.now(), tanggal: "", nilai: 0 }] }));
  };
  const removePembayaran = (id: number) => {
    setFormNonPUPN((prev) => ({ ...prev, pembayaran: prev.pembayaran.filter((p) => p.id !== id) }));
  };
  const updatePembayaran = (id: number, field: "tanggal" | "nilai", value: string | number) => {
    setFormNonPUPN((prev) => ({ ...prev, pembayaran: prev.pembayaran.map((p) => (p.id === id ? { ...p, [field]: value } : p)) }));
  };

  // Validasi
  const validateFormPUPN = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formPUPN.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formPUPN.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    if (formPUPN.nik && !/^\d{16}$/.test(formPUPN.nik)) newErrors.nik = "NIK harus 16 digit angka";
    if (!dokumenFiles["ba_lapangan"]) newErrors.dokumen = "Berita Acara (BA) Identifikasi Lapangan wajib diunggah.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFormNonPUPN = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formNonPUPN.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!formNonPUPN.alamat.trim()) newErrors.alamat = "Alamat wajib diisi";
    if (formNonPUPN.nilaiPiutang <= 0) newErrors.nilaiPiutang = "Nilai piutang harus lebih dari 0";
    if (!dokumenFiles["surat_tagihan"]) newErrors.dokumen = "Surat Tagihan wajib diunggah.";
    if (sisaUtang > 1_000_000_000 && !dokumenFiles["kerjasama_djkn"]) newErrors.dokumen = "Bukti Kerjasama dengan Kanwil DJKN wajib diunggah karena sisa utang > Rp 1 Miliar.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jalur === "PUPN") {
      if (validateFormPUPN()) onSubmit({ ...formPUPN, dokumen: dokumenFiles });
    } else {
      if (validateFormNonPUPN()) onSubmit({ ...formNonPUPN, saldoUtang, sisaUtang, dokumen: dokumenFiles });
    }
  };

  const totalPiutang = jalur === "PUPN" ? formPUPN.pokok + formPUPN.denda : formNonPUPN.nilaiPiutang;

  if (!isOpen) return null;

  const DokumenField = ({ id, label, required, keterangan }: { id: string; label: string; required?: boolean; keterangan?: string }) => {
    const file = dokumenFiles[id];
    const fileName = dokumenNama[id];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => { if (e.target.files?.[0]) handleFileChange(id, e.target.files[0]); }}
            className={`w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100 transition ${!file ? "border-dashed border-2 border-gray-300 bg-gray-50" : "border border-gray-200"} rounded-lg py-1`}
          />
          {!file && <UploadCloud className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none" />}
        </div>
        {file && fileName && (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2 mt-1 text-xs text-green-800">
            <span className="flex items-center gap-1 truncate"><Paperclip className="w-3.5 h-3.5" /> {fileName}</span>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => handlePreviewFile(id)} className="text-primary hover:text-primary-dark p-1" title="Pratinjau PDF"><Eye className="w-4 h-4" /></button>
              <button type="button" onClick={() => handleRemoveFile(id)} className="text-red-500 hover:text-red-700 p-1" title="Hapus file"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        )}
        {keterangan && <p className="text-xs text-gray-400 mt-1">{keterangan}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-fade-in border border-gray-100">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{initialData ? "Edit Penanggung Utang" : "Tambah Penanggung Utang"}</h2>
              <p className="text-xs text-gray-500">Lengkapi data dan dokumen pendukung</p>
            </div>
            <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium ${jalur === "PUPN" ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
              {jalur === "PUPN" ? "PUPN (PSBDT)" : "Non-PUPN (PPDTO)"}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {jalur === "PUPN" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formPUPN.nama} onChange={(e) => setFormPUPN({ ...formPUPN, nama: e.target.value })} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.nama ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
                  </div>
                  {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formPUPN.alamat} onChange={(e) => setFormPUPN({ ...formPUPN, alamat: e.target.value })} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.alamat ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
                  </div>
                  {errors.alamat && <p className="text-xs text-red-500 mt-1">{errors.alamat}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                  <input type="text" value={formPUPN.nik} onChange={(e) => setFormPUPN({ ...formPUPN, nik: e.target.value })} maxLength={16} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${errors.nik ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
                  {errors.nik && <p className="text-xs text-red-500 mt-1">{errors.nik}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formPUPN.pekerjaan} onChange={(e) => setFormPUPN({ ...formPUPN, pekerjaan: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Piutang</label>
                  <select value={formPUPN.jenisPiutang} onChange={(e) => setFormPUPN({ ...formPUPN, jenisPiutang: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white">
                    {jenisPiutangOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. SKRD</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formPUPN.noSkrd} onChange={(e) => setFormPUPN({ ...formPUPN, noSkrd: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. STRD</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formPUPN.noStrd} onChange={(e) => setFormPUPN({ ...formPUPN, noStrd: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pokok Piutang (Rp)</label>
                  <RupiahInput value={formPUPN.pokok} onChange={(v) => setFormPUPN({ ...formPUPN, pokok: v })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Denda (Rp)</label>
                  <RupiahInput value={formPUPN.denda} onChange={(v) => setFormPUPN({ ...formPUPN, denda: v })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Piutang</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={`Rp ${totalPiutang.toLocaleString("id-ID")}`} readOnly className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 font-semibold text-primary text-sm" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upaya Penagihan</label>
                <textarea rows={2} value={formPUPN.upayaPenagihan} onChange={(e) => setFormPUPN({ ...formPUPN, upayaPenagihan: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition" placeholder="Surat teguran, mediasi, dll." />
              </div>
            </>
          ) : (
            // ================= FORM NON-PUPN =================
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formNonPUPN.nama} onChange={(e) => setFormNonPUPN({ ...formNonPUPN, nama: e.target.value })} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm ${errors.nama ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                  </div>
                  {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
                </div>
                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={formNonPUPN.alamat} onChange={(e) => setFormNonPUPN({ ...formNonPUPN, alamat: e.target.value })} className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm ${errors.alamat ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                  </div>
                  {errors.alamat && <p className="text-xs text-red-500 mt-1">{errors.alamat}</p>}
                </div>
                {/* Nilai Piutang */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Piutang (Rp) <span className="text-red-500">*</span></label>
                  <RupiahInput
                    value={formNonPUPN.nilaiPiutang}
                    onChange={(v) => setFormNonPUPN({ ...formNonPUPN, nilaiPiutang: v })}
                    error={!!errors.nilaiPiutang}
                  />
                  {errors.nilaiPiutang && <p className="text-xs text-red-500 mt-1">{errors.nilaiPiutang}</p>}
                </div>
                {/* Tanggal Terjadi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terjadi Piutang</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={formNonPUPN.tanggalTerjadi} onChange={(e) => setFormNonPUPN({ ...formNonPUPN, tanggalTerjadi: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm" />
                  </div>
                </div>
                {/* Jatuh Tempo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jatuh Tempo / Macet</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={formNonPUPN.tanggalJatuhTempo} onChange={(e) => setFormNonPUPN({ ...formNonPUPN, tanggalJatuhTempo: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm" />
                  </div>
                </div>
                {/* Mata Uang */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mata Uang</label>
                  <CurrencySelect
                    value={formNonPUPN.mataUang}
                    onChange={(code) => setFormNonPUPN({ ...formNonPUPN, mataUang: code })}
                  />
                </div>
              </div>

              {/* ===== SECTION PEMBAYARAN (improved UX) ===== */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                {/* Header section */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-gray-700">Riwayat Pembayaran</span>
                    {formNonPUPN.pembayaran.length > 0 && (
                      <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">
                        {formNonPUPN.pembayaran.length} data
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addPembayaran}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary-dark transition shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                </div>

                {/* List pembayaran */}
                {formNonPUPN.pembayaran.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2 bg-white">
                    <DollarSign className="w-8 h-8 text-gray-200" />
                    <p className="text-sm">Belum ada riwayat pembayaran</p>
                    <button
                      type="button"
                      onClick={addPembayaran}
                      className="mt-1 text-xs text-primary hover:text-primary-dark underline underline-offset-2"
                    >
                      + Tambah pembayaran pertama
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 bg-white">
                    {/* Header kolom */}
                    <div className="grid grid-cols-[32px_1fr_1fr_36px] gap-3 px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/70">
                      <span className="text-center">#</span>
                      <span>Tanggal Pembayaran</span>
                      <span>Nominal (Rp)</span>
                      <span></span>
                    </div>
                    {formNonPUPN.pembayaran.map((p, idx) => (
                      <div key={p.id} className="grid grid-cols-[32px_1fr_1fr_36px] gap-3 items-center px-4 py-3 hover:bg-gray-50/60 transition group">
                        {/* Nomor urut */}
                        <span className="text-xs font-bold text-gray-300 text-center">{idx + 1}</span>
                        {/* Tanggal */}
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                          <input
                            type="date"
                            value={p.tanggal}
                            onChange={(e) => updatePembayaran(p.id, "tanggal", e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition bg-white"
                          />
                        </div>
                        {/* Nilai dengan format ribuan */}
                        <RupiahInput
                          value={p.nilai}
                          onChange={(v) => updatePembayaran(p.id, "nilai", v)}
                          placeholder="0"
                        />
                        {/* Hapus */}
                        <button
                          type="button"
                          onClick={() => removePembayaran(p.id)}
                          title="Hapus baris"
                          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer: ringkasan total pembayaran */}
                {formNonPUPN.pembayaran.length > 0 && (
                  <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-gray-50 border-t border-gray-200">
                    <span className="text-xs text-gray-500">Total Pembayaran:</span>
                    <span className="text-sm font-bold text-primary">
                      Rp {totalPembayaran.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>

              {/* Ringkasan keuangan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Total Pembayaran</p>
                  <p className="text-base font-bold text-gray-800">Rp {totalPembayaran.toLocaleString("id-ID")}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Saldo Utang</p>
                  <p className="text-base font-bold text-gray-800">Rp {saldoUtang.toLocaleString("id-ID")}</p>
                </div>
                <div className={`rounded-xl p-4 border ${sisaUtang > 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
                  <p className="text-xs font-medium text-gray-500 mb-1">Sisa Utang</p>
                  <p className={`text-base font-bold ${sisaUtang > 0 ? "text-red-600" : "text-green-600"}`}>
                    Rp {sisaUtang.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              {usiaWarning && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-sm text-yellow-800 flex gap-2 rounded-r-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {usiaWarning}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
                <textarea rows={2} value={formNonPUPN.keterangan} onChange={(e) => setFormNonPUPN({ ...formNonPUPN, keterangan: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm" placeholder="Keberadaan, kemampuan bayar, kondisi barang jaminan, dll." />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 flex gap-2 border border-blue-100">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-semibold">Persyaratan usia piutang (Lampiran II E):</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>≤ Rp8 juta → usia &gt; 5 tahun</li>
                    <li>Rp8 juta – Rp50 juta → usia &gt; 7 tahun</li>
                    <li>Rp50 juta – Rp1 Miliar → usia &gt; 10 tahun</li>
                    <li>&gt; Rp1 Miliar → usia &gt; 10 tahun + kerjasama dengan Kanwil DJKN</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* DOKUMEN & LAMPIRAN */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-1">
              <Paperclip className="w-5 h-5 text-primary" /> Dokumen Persyaratan
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {jalur === "PUPN" ? "Unggah dokumen pendukung dalam format PDF. Berita Acara Lapangan wajib diisi." : "Unggah minimal satu dokumen pendukung. Surat Tagihan wajib diisi. Kerjasama DJKN wajib jika sisa utang > 1 M."}
            </p>
            {errors.dokumen && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errors.dokumen}</span>
              </div>
            )}
            {jalur === "PUPN" ? (
              <>
                {DOKUMEN_PUPN.wajib.map(doc => <DokumenField key={doc.id} {...doc} required />)}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Dokumen Opsional Lainnya</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {DOKUMEN_PUPN.opsional.map(doc => <DokumenField key={doc.id} {...doc} />)}
                  </div>
                </div>
              </>
            ) : (
              <>
                {DOKUMEN_NON_PUPN.wajib.map(doc => <DokumenField key={doc.id} {...doc} required />)}
                {DOKUMEN_NON_PUPN.wajibKondisional(formNonPUPN.nilaiPiutang, sisaUtang).map(doc => <DokumenField key={doc.id} {...doc} required />)}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-3">Dokumen Opsional Lainnya</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {DOKUMEN_NON_PUPN.opsional.map(doc => <DokumenField key={doc.id} {...doc} />)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium text-sm">Batal</button>
            <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium flex items-center gap-2 shadow-sm text-sm">
              <User className="w-4 h-4" />
              {initialData ? "Simpan Perubahan" : "Simpan Penanggung Utang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}