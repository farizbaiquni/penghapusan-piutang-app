"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Search,
  Users,
  MapPin,
  CreditCard,
  Briefcase,
  FileCheck,
  AlertCircle,
  DollarSign,
  Hash,
  BookOpen,
  CheckCircle,
  Loader2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { downloadPiutangPDF, UsulanPiutang } from "@/lib/pdfGenerator";

type FormData = {
  namaWp: string;
  alamatWp: string;
  nik: string;
  pekerjaan: string;
  jenisPiutang: string;
  noSkrdStrd: string;
  sebabMacet: string;
  pokok: number;
  denda: number;
  upayaPenagihan: string;
};

type ValidationErrors = {
  namaWp?: string;
  jenisPiutang?: string;
  nik?: string;
};

type UsulanPiutangContentProps = {
  usulanList: UsulanPiutang[];
  setUsulanList: React.Dispatch<React.SetStateAction<UsulanPiutang[]>>;
};

export default function UsulanPiutangContent({
  usulanList,
  setUsulanList,
}: UsulanPiutangContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJenis, setSelectedJenis] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [useShortFormat, setUseShortFormat] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    namaWp: "",
    alamatWp: "",
    nik: "",
    pekerjaan: "",
    jenisPiutang: "",
    noSkrdStrd: "",
    sebabMacet: "",
    pokok: 0,
    denda: 0,
    upayaPenagihan: "",
  });

  const namaWpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (namaWpRef.current) {
      namaWpRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const totalPiutang = formData.pokok + formData.denda;

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

  const formatRupiahForPDF = (angka: number): string => {
    return formatRupiahFull(angka);
  };

  const handleExportPDF = async () => {
    if (usulanList.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    setIsExporting(true);
    try {
      await downloadPiutangPDF({
        data: usulanList,
        searchTerm,
        selectedJenis,
        formatRupiah: formatRupiahForPDF,
      });
    } catch (error) {
      console.error("Export PDF error:", error);
      alert("Terjadi kesalahan saat mengexport PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const validateField = (
    name: keyof FormData,
    value: string | number,
  ): string => {
    switch (name) {
      case "namaWp":
        if (!value || (typeof value === "string" && value.trim() === ""))
          return "Nama WP wajib diisi";
        return "";
      case "jenisPiutang":
        if (!value) return "Jenis piutang wajib dipilih";
        return "";
      case "nik":
        if (value && typeof value === "string" && !/^\d{16}$/.test(value))
          return "NIK harus 16 digit angka";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "pokok" || name === "denda"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));

    if (name === "namaWp" || name === "jenisPiutang" || name === "nik") {
      const error = validateField(name as keyof FormData, value);
      setValidationErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (name === "namaWp" || name === "jenisPiutang" || name === "nik") {
      const error = validateField(name as keyof FormData, value);
      setValidationErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;
    if (!formData.namaWp || formData.namaWp.trim() === "") {
      setValidationErrors((prev) => ({
        ...prev,
        namaWp: "Nama WP wajib diisi",
      }));
      setTouched((prev) => ({ ...prev, namaWp: true }));
      hasError = true;
    }
    if (!formData.jenisPiutang) {
      setValidationErrors((prev) => ({
        ...prev,
        jenisPiutang: "Jenis piutang wajib dipilih",
      }));
      setTouched((prev) => ({ ...prev, jenisPiutang: true }));
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newUsulan: UsulanPiutang = {
        no: usulanList.length + 1,
        namaWp: formData.namaWp,
        alamatWp: formData.alamatWp,
        nik: formData.nik,
        pekerjaan: formData.pekerjaan,
        jenisPiutang: formData.jenisPiutang,
        noSkrdStrd: formData.noSkrdStrd,
        sebabMacet: formData.sebabMacet,
        pokok: formData.pokok,
        denda: formData.denda,
        total: totalPiutang,
        upayaPenagihan: formData.upayaPenagihan,
        createdAt: new Date(),
      };

      setUsulanList([newUsulan, ...usulanList]);
      setFormData({
        namaWp: "",
        alamatWp: "",
        nik: "",
        pekerjaan: "",
        jenisPiutang: "",
        noSkrdStrd: "",
        sebabMacet: "",
        pokok: 0,
        denda: 0,
        upayaPenagihan: "",
      });
      setTouched({});
      setValidationErrors({});
      setIsSubmitting(false);
      setShowSuccess(true);

      if (namaWpRef.current) namaWpRef.current.focus();
    }, 500);
  };

  const handleDelete = (no: number) => {
    const newList = usulanList.filter((item) => item.no !== no);
    const renumberedList = newList.map((item, idx) => ({
      ...item,
      no: idx + 1,
    }));
    setUsulanList(renumberedList);
  };

  const handleDeleteAll = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua data usulan?")) {
      setUsulanList([]);
    }
  };

  const filteredList = usulanList
    .filter((item) => {
      const matchSearch =
        item.namaWp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nik.includes(searchTerm) ||
        (item.alamatWp &&
          item.alamatWp.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchJenis = !selectedJenis || item.jenisPiutang === selectedJenis;
      return matchSearch && matchJenis;
    })
    .sort((a, b) => a.no - b.no);

  const totalPokok = usulanList.reduce((sum, item) => sum + item.pokok, 0);
  const totalDenda = usulanList.reduce((sum, item) => sum + item.denda, 0);
  const totalKeseluruhan = usulanList.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const jenisPiutangOptions: string[] = [
    "Piutang Retribusi Daerah",
    "Piutang Daerah Lainnya",
    "Piutang BLUD",
    "Tuntutan Perbendaharaan (TP)",
    "Tuntutan Ganti Rugi (TGR)",
  ];

  const getFieldError = (fieldName: keyof ValidationErrors): string | null => {
    return touched[fieldName] && validationErrors[fieldName]
      ? validationErrors[fieldName]
      : null;
  };

  return (
    <div className="p-6">
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 rounded-md px-4 py-3 flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-700" />
          <span className="text-sm text-green-700">
            Usulan berhasil ditambahkan!
          </span>
        </div>
      )}

      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Usulan Penghapusan Piutang Daerah
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola dan ajukan usulan penghapusan piutang daerah Kabupaten Kendal
          </p>
        </div>

        <div className="flex gap-3">
          {usulanList.length > 0 && (
            <button
              onClick={() => setUseShortFormat(!useShortFormat)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition shadow-sm"
            >
              {useShortFormat ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
              {useShortFormat ? "Lengkap" : "Sederhana"}
            </button>
          )}

          {usulanList.length > 0 && (
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Mengekspor...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Export PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Statistik Cards */}
      {usulanList.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total Usulan
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {usulanList.length}
                </p>
                <p className="text-xs text-gray-400 mt-1">Wajib Pajak</p>
              </div>
              <div className="bg-primary-50 p-2 rounded-md shrink-0 ml-3 mt-0.5">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total Pokok
                </p>
                <p className="text-xl font-bold text-green-700 mt-1 break-words">
                  {useShortFormat
                    ? formatRupiahShort(totalPokok)
                    : formatRupiahFull(totalPokok)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Nilai pokok piutang
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-md shrink-0 ml-3 mt-0.5">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total Denda
                </p>
                <p className="text-xl font-bold text-orange-700 mt-1 break-words">
                  {useShortFormat
                    ? formatRupiahShort(totalDenda)
                    : formatRupiahFull(totalDenda)}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sanksi administrasi
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded-md shrink-0 ml-3 mt-0.5">
                <AlertCircle className="w-5 h-5 text-orange-700" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-md border border-gray-200 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Total Keseluruhan
                </p>
                <p className="text-xl font-bold text-primary mt-1 break-words">
                  {useShortFormat
                    ? formatRupiahShort(totalKeseluruhan)
                    : formatRupiahFull(totalKeseluruhan)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Pokok + Denda</p>
              </div>
              <div className="bg-primary-50 p-2 rounded-md shrink-0 ml-3 mt-0.5">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Input */}
      <div className="bg-white rounded-md border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            FORM INPUT USULAN PIUTANG
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                NAMA WP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={namaWpRef}
                  type="text"
                  name="namaWp"
                  value={formData.namaWp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Masukkan nama wajib pajak"
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                    getFieldError("namaWp")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              </div>
              {getFieldError("namaWp") && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {getFieldError("namaWp")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                NIK
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="nik"
                  value={formData.nik}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="16 digit NIK"
                  maxLength={16}
                  className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition ${
                    getFieldError("nik")
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              </div>
              {getFieldError("nik") && (
                <p className="text-xs text-red-500 mt-1">
                  {getFieldError("nik")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                PEKERJAAN
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="pekerjaan"
                  value={formData.pekerjaan}
                  onChange={handleChange}
                  placeholder="Pekerjaan"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                ALAMAT WP
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  name="alamatWp"
                  value={formData.alamatWp}
                  onChange={handleChange}
                  placeholder="Alamat lengkap wajib pajak"
                  rows={2}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                UPAYA PENAGIHAN
              </label>
              <div className="relative">
                <AlertCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  name="upayaPenagihan"
                  value={formData.upayaPenagihan}
                  onChange={handleChange}
                  placeholder="Contoh: Surat teguran 1, 2, 3, mediasi, dll"
                  rows={2}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                JENIS PIUTANG <span className="text-red-500">*</span>
              </label>
              <select
                name="jenisPiutang"
                value={formData.jenisPiutang}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-white ${
                  getFieldError("jenisPiutang")
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200"
                }`}
              >
                <option value="">Pilih Jenis Piutang</option>
                <option value="Piutang Retribusi Daerah">
                  Piutang Retribusi Daerah
                </option>
                <option value="Piutang Daerah Lainnya">
                  Piutang Daerah Lainnya
                </option>
                <option value="Piutang BLUD">Piutang BLUD</option>
                <option value="Tuntutan Perbendaharaan (TP)">
                  Tuntutan Perbendaharaan (TP)
                </option>
                <option value="Tuntutan Ganti Rugi (TGR)">
                  Tuntutan Ganti Rugi (TGR)
                </option>
              </select>
              {getFieldError("jenisPiutang") && (
                <p className="text-xs text-red-500 mt-1">
                  {getFieldError("jenisPiutang")}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                NO. SKRD / STRD / DLL
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="noSkrdStrd"
                  value={formData.noSkrdStrd}
                  onChange={handleChange}
                  placeholder="Nomor SKRD/STRD"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-2">
              RINCIAN PIUTANG
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    name="pokok"
                    value={formData.pokok || ""}
                    onChange={handleChange}
                    placeholder="Pokok Piutang"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Pokok Piutang</p>
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    Rp
                  </span>
                  <input
                    type="number"
                    name="denda"
                    value={formData.denda || ""}
                    onChange={handleChange}
                    placeholder="Denda"
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Denda / Sanksi</p>
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={
                      totalPiutang === 0 ? "" : formatRupiahFull(totalPiutang)
                    }
                    placeholder="Total Piutang"
                    readOnly
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 font-medium text-primary"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Total (otomatis)</p>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              SEBAB PIUTANG MACET
            </label>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                name="sebabMacet"
                value={formData.sebabMacet}
                onChange={handleChange}
                placeholder="Jelaskan penyebab piutang menjadi macet..."
                rows={2}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Tambah Usulan
                </>
              )}
            </button>
            {usulanList.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAll}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-md hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Semua
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Filter dan Tabel */}
      {usulanList.length > 0 && (
        <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-5 py-3 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-gray-700">
                Daftar Usulan Piutang
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {filteredList.length} data
              </span>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau alamat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                />
              </div>
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="">Semua Jenis</option>
                {jenisPiutangOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Nama WP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Alamat WP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    NIK
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pekerjaan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Jenis Piutang
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    No SKRD/STRD
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sebab Macet
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Pokok
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Denda
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((item) => (
                  <tr
                    key={item.no}
                    className="hover:bg-gray-50 transition align-top"
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 text-center">
                      {item.no}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 break-words whitespace-normal">
                      {item.namaWp}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 break-words whitespace-normal overflow-wrap-anywhere leading-relaxed">
                      {item.alamatWp || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 break-words whitespace-normal">
                      {item.nik || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 break-words whitespace-normal">
                      {item.pekerjaan || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary break-words whitespace-normal">
                        {item.jenisPiutang}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 break-words whitespace-normal">
                      {item.noSkrdStrd || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 break-words whitespace-normal leading-relaxed">
                      {item.sebabMacet || "-"}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-right font-medium text-green-700"
                      title={formatRupiahFull(item.pokok)}
                    >
                      {formatRupiah(item.pokok)}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-right text-orange-700"
                      title={formatRupiahFull(item.denda)}
                    >
                      {formatRupiah(item.denda)}
                    </td>
                    <td
                      className="px-4 py-3 text-xs text-right font-semibold text-primary"
                      title={formatRupiahFull(item.total)}
                    >
                      {formatRupiah(item.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(item.no)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        title="Hapus usulan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-2 text-right text-xs font-medium text-gray-600"
                  >
                    TOTAL:
                  </td>
                  <td className="px-4 py-2 text-right text-xs font-medium text-green-700">
                    {useShortFormat
                      ? formatRupiahShort(totalPokok)
                      : formatRupiahFull(totalPokok)}
                  </td>
                  <td className="px-4 py-2 text-right text-xs font-medium text-orange-700">
                    {useShortFormat
                      ? formatRupiahShort(totalDenda)
                      : formatRupiahFull(totalDenda)}
                  </td>
                  <td className="px-4 py-2 text-right text-xs font-semibold text-primary">
                    {useShortFormat
                      ? formatRupiahShort(totalKeseluruhan)
                      : formatRupiahFull(totalKeseluruhan)}
                  </td>
                  <td className="px-4 py-2"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {filteredList.length === 0 && searchTerm && (
            <div className="text-center py-8 text-sm text-gray-500">
              Tidak ada data yang sesuai dengan pencarian &quot; {searchTerm}{" "}
              &quot;
            </div>
          )}
        </div>
      )}

      {usulanList.length === 0 && (
        <div className="bg-white rounded-md border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-700 mb-1">
            Belum Ada Data Usulan
          </h3>
          <p className="text-sm text-gray-400">
            Silakan tambahkan usulan piutang melalui form di atas
          </p>
        </div>
      )}
    </div>
  );
}
