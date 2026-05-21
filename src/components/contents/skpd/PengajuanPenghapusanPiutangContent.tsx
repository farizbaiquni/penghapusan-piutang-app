// components/contents/skpd/PengajuanPenghapusanPiutangContent.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  Users,
  FileText,
  Edit,
  Save,
  X,
  Send,
  Banknote,
  Calendar,
  ShieldCheck,
  CircleCheck,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  PenLine,
  Hash,
  Briefcase,
  ReceiptText,
  Wallet,
  Building2,
  CheckCheck,
} from "lucide-react";
import FormPenanggungUtangModal, {
  FormDataPUPN,
  FormDataNonPUPN,
} from "@/components/modals/FormPenanggungUtangModal";

// ─────────────────────────── Types ───────────────────────────
interface PengajuanPenghapusanPiutangProps {
  role: "SKPD" | "BPKAD" | "INSPEKTORAT";
  onDokumenIndukAdd?: (dokumen: DokumenInduk) => void;
  onSaveDokumen?: (
    dokumen: DokumenInduk,
    nominatifList: (FormDataPUPN | FormDataNonPUPN)[]
  ) => void;
  onUnsavedChange?: (state: {
    hasUnsaved: boolean;
    judul: string;
    nominatifCount: number;
    triggerSaveDraft: () => void;
    triggerDiscard: () => void;
  }) => void;
}

export type DokumenInduk = {
  id: number;
  judul: string;
  jenisPengajuan: "PUPN" | "NON-PUPN";
  timestamp: string;
  nominatifIds: number[];
  status: "DRAFT" | "DIAJUKAN" | string;
};

type NominatifPUPN = {
  id: number;
  nama: string;
  alamat: string;
  nik: string;
  pekerjaan: string;
  jenisPiutang: string;
  noSkrd: string;
  noStrd: string;
  pokok: number;
  denda: number;
  total: number;
  upayaPenagihan: string;
  dokumenId: number;
  dokumenFiles?: Record<string, File | null>;
};

type NominatifNonPUPN = {
  id: number;
  nama: string;
  alamat: string;
  nilaiPiutang: number;
  tanggalTerjadi: string;
  tanggalJatuhTempo: string;
  mataUang: string;
  pembayaran: { tanggal: string; nilai: number }[];
  saldoUtang: number;
  sisaUtang: number;
  keterangan: string;
  dokumenId: number;
  dokumenFiles?: Record<string, File | null>;
};

function toFormDataPUPN(item: NominatifPUPN): FormDataPUPN {
  return {
    nama: item.nama, alamat: item.alamat, nik: item.nik, pekerjaan: item.pekerjaan,
    jenisPiutang: item.jenisPiutang, noSkrd: item.noSkrd, noStrd: item.noStrd,
    pokok: item.pokok, denda: item.denda, upayaPenagihan: item.upayaPenagihan,
    dokumen: item.dokumenFiles ?? {},
  };
}

function toFormDataNonPUPN(item: NominatifNonPUPN): FormDataNonPUPN {
  return {
    nama: item.nama, alamat: item.alamat, nilaiPiutang: item.nilaiPiutang,
    tanggalTerjadi: item.tanggalTerjadi, tanggalJatuhTempo: item.tanggalJatuhTempo,
    mataUang: item.mataUang,
    pembayaran: item.pembayaran.map((p, idx) => ({ id: Date.now() + idx, tanggal: p.tanggal, nilai: p.nilai })),
    saldoUtang: item.saldoUtang, sisaUtang: item.sisaUtang,
    keterangan: item.keterangan, dokumen: item.dokumenFiles ?? {},
  };
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
}

// ─────────────────────────── Component ───────────────────────────
export default function PengajuanPenghapusanPiutang({
  role,
  onDokumenIndukAdd,
  onSaveDokumen,
  onUnsavedChange,
}: PengajuanPenghapusanPiutangProps) {
  const [step, setStep] = useState(1);
  const [jalur, setJalur] = useState<"PUPN" | "NON-PUPN" | null>(null);
  const [answers, setAnswers] = useState({ q1: "", q2: "" });
  const [dokumenInduk, setDokumenInduk] = useState<DokumenInduk | null>(null);
  const [judulDokumen, setJudulDokumen] = useState("");
  const [judulError, setJudulError] = useState("");
  const [isEditingJudul, setIsEditingJudul] = useState(false);
  const [editedJudul, setEditedJudul] = useState("");
  const [nominatifPUPNList, setNominatifPUPNList] = useState<NominatifPUPN[]>([]);
  const [nominatifNonPUPNList, setNominatifNonPUPNList] = useState<NominatifNonPUPN[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNominatif, setEditingNominatif] = useState<any>(null);
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);
  const judulRef = useRef<HTMLInputElement>(null);

  // ── Unsaved state ──
  const nominatifCount = jalur === "PUPN" ? nominatifPUPNList.length : nominatifNonPUPNList.length;
  const isUnsaved = step >= 2 && (nominatifCount > 0 || !!judulDokumen || !!dokumenInduk);

  const triggerDiscard = useCallback(() => {
    setDokumenInduk(null); setJudulDokumen(""); setNominatifPUPNList([]);
    setNominatifNonPUPNList([]); setStep(1); setJalur(null); setAnswers({ q1: "", q2: "" });
  }, []);

  const triggerSaveDraft = useCallback(() => {
    if (!dokumenInduk) return;
    const updatedDokumen: DokumenInduk = {
      ...dokumenInduk, status: "DRAFT",
      nominatifIds: jalur === "PUPN" ? nominatifPUPNList.map(n => n.id) : nominatifNonPUPNList.map(n => n.id),
    };
    const allNominatif: (FormDataPUPN | FormDataNonPUPN)[] =
      jalur === "PUPN" ? nominatifPUPNList.map(toFormDataPUPN) : nominatifNonPUPNList.map(toFormDataNonPUPN);
    if (onSaveDokumen) onSaveDokumen(updatedDokumen, allNominatif);
    else if (onDokumenIndukAdd) onDokumenIndukAdd(updatedDokumen);
    triggerDiscard();
  }, [dokumenInduk, jalur, nominatifPUPNList, nominatifNonPUPNList, onSaveDokumen, onDokumenIndukAdd, triggerDiscard]);

  useEffect(() => {
    if (onUnsavedChange) {
      onUnsavedChange({
        hasUnsaved: isUnsaved,
        judul: dokumenInduk?.judul || judulDokumen || "",
        nominatifCount, triggerSaveDraft, triggerDiscard,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnsaved, dokumenInduk?.judul, judulDokumen, nominatifCount]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isUnsaved) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isUnsaved]);

  // ── Wizard ──
  const answerQ1 = (ans: string) => {
    setAnswers({ ...answers, q1: ans });
    if (ans === "YA") { setJalur("NON-PUPN"); setStep(2); } else { setStep(1.5); }
  };
  const answerQ2 = (ans: string) => {
    setAnswers({ ...answers, q2: ans });
    setJalur(ans === "YA" ? "NON-PUPN" : "PUPN");
    setStep(2);
  };

  // ── Dokumen induk ──
  const saveDokumen = (status: "DRAFT" | "DIAJUKAN") => {
    if (!dokumenInduk) return;
    const updatedDokumen: DokumenInduk = {
      ...dokumenInduk, status,
      nominatifIds: jalur === "PUPN" ? nominatifPUPNList.map(n => n.id) : nominatifNonPUPNList.map(n => n.id),
    };
    if (onSaveDokumen) {
      const allNominatif: (FormDataPUPN | FormDataNonPUPN)[] =
        jalur === "PUPN" ? nominatifPUPNList.map(toFormDataPUPN) : nominatifNonPUPNList.map(toFormDataNonPUPN);
      onSaveDokumen(updatedDokumen, allNominatif);
    } else if (onDokumenIndukAdd) { onDokumenIndukAdd(updatedDokumen); }
    setDokumenInduk(null); setJudulDokumen(""); setNominatifPUPNList([]);
    setNominatifNonPUPNList([]); setStep(1); setJalur(null);
  };

  const handleSaveDokumenInduk = () => {
    if (!judulDokumen.trim()) { setJudulError("Judul dokumen wajib diisi"); judulRef.current?.focus(); return; }
    setJudulError("");
    const newDokumen: DokumenInduk = {
      id: Date.now(), judul: judulDokumen, jenisPengajuan: jalur!,
      timestamp: new Date().toLocaleString("id-ID"), nominatifIds: [], status: "DRAFT",
    };
    setDokumenInduk(newDokumen);
    if (onDokumenIndukAdd) onDokumenIndukAdd(newDokumen);
    setStep(3);
  };

  // ── Nominatif ──
  const addNominatifPUPN = (data: FormDataPUPN) => {
    setNominatifPUPNList(prev => [...prev, { id: Date.now(), ...data, total: data.pokok + data.denda, dokumenId: dokumenInduk!.id, dokumenFiles: data.dokumen }]);
    setShowModal(false);
  };
  const addNominatifNonPUPN = (data: FormDataNonPUPN) => {
    const cleanedPembayaran = (data.pembayaran || []).map(p => ({ tanggal: p.tanggal, nilai: p.nilai }));
    const totalPembayaran = cleanedPembayaran.reduce((s, p) => s + p.nilai, 0);
    const saldoUtang = data.nilaiPiutang - totalPembayaran;
    setNominatifNonPUPNList(prev => [...prev, {
      id: Date.now(), nama: data.nama, alamat: data.alamat, nilaiPiutang: data.nilaiPiutang,
      tanggalTerjadi: data.tanggalTerjadi, tanggalJatuhTempo: data.tanggalJatuhTempo,
      mataUang: data.mataUang, pembayaran: cleanedPembayaran, saldoUtang, sisaUtang: saldoUtang,
      keterangan: data.keterangan, dokumenId: dokumenInduk!.id, dokumenFiles: data.dokumen,
    }]);
    setShowModal(false);
  };
  const updateNominatifPUPN = (data: FormDataPUPN) => {
    if (!editingNominatif) return;
    setNominatifPUPNList(prev => prev.map(i => i.id === editingNominatif.id ? { ...i, ...data, total: data.pokok + data.denda, dokumenFiles: data.dokumen } : i));
    setEditingNominatif(null); setShowModal(false);
  };
  const updateNominatifNonPUPN = (data: FormDataNonPUPN) => {
    if (!editingNominatif) return;
    const cleaned = (data.pembayaran || []).map(p => ({ tanggal: p.tanggal, nilai: p.nilai }));
    const total = cleaned.reduce((s, p) => s + p.nilai, 0);
    const saldo = data.nilaiPiutang - total;
    setNominatifNonPUPNList(prev => prev.map(i => i.id === editingNominatif.id
      ? { ...i, nama: data.nama, alamat: data.alamat, nilaiPiutang: data.nilaiPiutang, tanggalTerjadi: data.tanggalTerjadi, tanggalJatuhTempo: data.tanggalJatuhTempo, mataUang: data.mataUang, pembayaran: cleaned, saldoUtang: saldo, sisaUtang: saldo, keterangan: data.keterangan, dokumenFiles: data.dokumen }
      : i));
    setEditingNominatif(null); setShowModal(false);
  };
  const handleSubmitModal = (data: any) => {
    if (editingNominatif) {
      if (jalur === "PUPN") updateNominatifPUPN(data); else updateNominatifNonPUPN(data);
    } else {
      if (jalur === "PUPN") addNominatifPUPN(data); else addNominatifNonPUPN(data);
    }
  };
  const deleteNominatif = (id: number) => {
    if (jalur === "PUPN") setNominatifPUPNList(prev => prev.filter(i => i.id !== id));
    else setNominatifNonPUPNList(prev => prev.filter(i => i.id !== id));
  };

  // ── Submit ──
  const submitPengajuan = () => {
    const count = jalur === "PUPN" ? nominatifPUPNList.length : nominatifNonPUPNList.length;
    if (count === 0) { alert("Tambahkan minimal satu data penanggung utang"); return; }
    saveDokumen("DIAJUKAN");
    setShowSubmitSuccess(true);
    setTimeout(() => setShowSubmitSuccess(false), 3500);
  };

  // ── Edit judul ──
  const startEditJudul = () => { if (dokumenInduk) { setEditedJudul(dokumenInduk.judul); setIsEditingJudul(true); } };
  const saveJudul = () => { if (dokumenInduk && editedJudul.trim()) setDokumenInduk({ ...dokumenInduk, judul: editedJudul.trim() }); setIsEditingJudul(false); };

  // ────────────────────────── STEP 1 ──────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Langkah 1 dari 3 — Penentuan Jalur</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: "33%" }} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Info banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5 flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800 mb-0.5">Acuan Regulasi</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Non-PUPN (PPDTO) jika sisa utang ≤ Rp8.000.000 & tidak ada jaminan bernilai ekonomis,
                <em> atau</em> piutang tidak pasti secara hukum. Selain itu menggunakan jalur PUPN (PSBDT).
              </p>
            </div>
          </div>

          {/* Kartu pertanyaan */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header card */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Pertanyaan 1</p>
                <p className="text-sm font-semibold text-gray-700">Syarat Piutang & Jaminan</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm leading-relaxed mb-5">
                Apakah{" "}
                <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">sisa utang ≤ Rp8.000.000</span>
                {" "}atau setara dan{" "}
                <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">tidak ada barang jaminan</span>
                {" "}yang diserahkan atau barang jaminan{" "}
                <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">tidak mempunyai nilai ekonomis</span>?
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-5 text-xs text-gray-500">
                <span className="font-semibold text-gray-600">📌 Nilai ekonomis:</span> biaya penjualan melebihi hasil penjualan dari barang jaminan tersebut.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => answerQ1("YA")}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-sm text-emerald-700">YA</span>
                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">→ Jalur Non-PUPN</span>
                </button>
                <button
                  onClick={() => answerQ1("TIDAK")}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  </div>
                  <span className="font-semibold text-sm text-gray-600">TIDAK</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">→ Lanjut Pertanyaan 2</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────── STEP 1.5 ──────────────────────────
  if (step === 1.5) {
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Langkah 1 dari 3 — Penentuan Jalur</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: "33%" }} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Jalur Q1 badge */}
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
              <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
              <span>Pertanyaan 1: <strong>TIDAK</strong></span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Pertanyaan 2</p>
                <p className="text-sm font-semibold text-gray-700">Ketidakpastian Hukum</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Apakah Piutang Daerah{" "}
                <span className="font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">tidak memenuhi syarat</span>
                {" "}untuk diserahkan kepada PUPN, yaitu{" "}
                <span className="font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded-md">adanya dan besarnya tidak pasti secara hukum</span>?
              </p>

              {/* Kriteria list */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wider">Kriteria Tidak Pasti Hukum (Lampiran II A.5 Perbup)</p>
                <div className="space-y-1.5">
                  {[
                    "Tidak didukung dokumen sumber yang memadai",
                    "Jumlah piutang tidak dapat dipastikan",
                    "Masih dalam sengketa peradilan",
                    "Telah ditolak oleh PUPN",
                  ].map((k, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-800">
                      <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold flex-shrink-0 text-[10px]">{String.fromCharCode(97 + i)}</span>
                      {k}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => answerQ2("YA")}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-sm text-emerald-700">YA</span>
                  <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">→ Jalur Non-PUPN</span>
                </button>
                <button
                  onClick={() => answerQ2("TIDAK")}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-sm text-blue-700">TIDAK</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">→ Jalur PUPN</span>
                </button>
              </div>
            </div>
          </div>

          <button onClick={() => setStep(1)} className="mt-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pertanyaan 1
          </button>
        </div>
      </div>
    );
  }

  // ────────────────────────── STEP 2 ──────────────────────────
  if (step === 2) {
    const isPUPN = jalur === "PUPN";
    return (
      <div className="min-h-full bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Langkah 2 dari 3 — Detail Dokumen</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: "66%" }} />
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Hasil jalur */}
          <div className={`flex items-center gap-4 p-4 rounded-2xl border mb-5 ${isPUPN ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200"}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPUPN ? "bg-blue-100" : "bg-emerald-100"}`}>
              {isPUPN ? <ShieldCheck className="w-6 h-6 text-blue-600" /> : <CircleCheck className="w-6 h-6 text-emerald-600" />}
            </div>
            <div className="flex-1">
              <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${isPUPN ? "text-blue-500" : "text-emerald-500"}`}>Jalur Terpilih</p>
              <p className={`font-bold text-base ${isPUPN ? "text-blue-700" : "text-emerald-700"}`}>
                {isPUPN ? "PUPN — Piutang Negara (PSBDT)" : "Non-PUPN — Penghapusan PPKD (PPDTO)"}
              </p>
              <p className={`text-xs mt-0.5 ${isPUPN ? "text-blue-600" : "text-emerald-600"}`}>
                {isPUPN ? "Piutang akan dilimpahkan ke Panitia Urusan Piutang Negara." : "Piutang diproses secara intern oleh PPKD Kabupaten Kendal."}
              </p>
            </div>
          </div>

          {/* Form judul */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <PenLine className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Identitas Dokumen</p>
                <p className="text-sm font-semibold text-gray-700">Buat Dokumen Pengajuan</p>
              </div>
            </div>

            <div className="px-6 py-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Judul Dokumen <span className="text-red-500">*</span>
              </label>
              <input
                ref={judulRef}
                type="text"
                value={judulDokumen}
                onChange={(e) => { setJudulDokumen(e.target.value); if (e.target.value.trim()) setJudulError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSaveDokumenInduk()}
                placeholder="Contoh: Penghapusan Piutang Retribusi Dinas Pendidikan TA 2025"
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition ${judulError ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:bg-white"}`}
              />
              {judulError && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{judulError}</p>}
              <p className="text-xs text-gray-400 mt-2">Gunakan nama yang deskriptif agar mudah diidentifikasi oleh BPKAD.</p>
            </div>

            <div className="px-6 pb-6 flex items-center justify-between">
              <button onClick={() => { setStep(1); setJalur(null); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>
              <button
                onClick={handleSaveDokumenInduk}
                className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary-dark transition shadow-sm font-medium text-sm"
              >
                Lanjut & Tambah Penanggung Utang <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────── STEP 3 ──────────────────────────
  if (step === 3 && dokumenInduk) {
    const isPUPN = jalur === "PUPN";
    const nominatifList = isPUPN ? nominatifPUPNList : nominatifNonPUPNList;
    const totalPokok = isPUPN ? nominatifPUPNList.reduce((s, i) => s + i.pokok, 0) : 0;
    const totalDenda = isPUPN ? nominatifPUPNList.reduce((s, i) => s + i.denda, 0) : 0;
    const totalNilai = isPUPN ? totalPokok + totalDenda : nominatifNonPUPNList.reduce((s, i) => s + i.nilaiPiutang, 0);
    const totalSaldo = isPUPN ? 0 : nominatifNonPUPNList.reduce((s, i) => s + i.saldoUtang, 0);
    const totalSisa = isPUPN ? 0 : nominatifNonPUPNList.reduce((s, i) => s + i.sisaUtang, 0);

    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6">
        {/* Progress */}
        <div className="max-w-full mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Langkah 3 dari 3 — Daftar Penanggung Utang</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        {/* Success toast */}
        {showSubmitSuccess && (
          <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl">
            <CheckCircle className="w-5 h-5" />
            <div>
              <p className="font-semibold text-sm">Berhasil dikirim ke BPKAD!</p>
              <p className="text-xs text-emerald-100">Dokumen menunggu verifikasi PPKD.</p>
            </div>
          </div>
        )}

        {/* Header dokumen */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Kiri: info dokumen */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${isPUPN ? "bg-blue-50" : "bg-emerald-50"}`}>
                  {isPUPN ? <ShieldCheck className={`w-5 h-5 text-blue-600`} /> : <CircleCheck className="w-5 h-5 text-emerald-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditingJudul ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editedJudul}
                        onChange={(e) => setEditedJudul(e.target.value)}
                        onBlur={saveJudul}
                        onKeyDown={(e) => e.key === "Enter" && saveJudul()}
                        className="border border-primary/40 rounded-lg px-3 py-1.5 text-sm font-semibold w-full max-w-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                      <button onClick={saveJudul} className="text-primary hover:text-primary-dark p-1"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => setIsEditingJudul(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-gray-800 text-base truncate max-w-md">{dokumenInduk.judul}</h2>
                      <button onClick={startEditJudul} className="text-gray-300 hover:text-primary transition flex-shrink-0" title="Edit judul">
                        <PenLine className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-gray-400">ID #{dokumenInduk.id}</span>
                    <span className="text-gray-200">·</span>
                    <span className="text-[11px] text-gray-400">{dokumenInduk.timestamp}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${isPUPN ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                      {isPUPN ? "PUPN (PSBDT)" : "Non-PUPN (PPDTO)"}
                    </span>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600">
                      Draft
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kanan: tombol tambah */}
            <div className="flex-shrink-0">
              <button
                onClick={() => { setEditingNominatif(null); setShowModal(true); }}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-dark transition shadow-sm text-sm font-semibold"
              >
                <Plus className="w-4 h-4" /> Tambah Penanggung Utang
              </button>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className={`grid gap-3 mb-5 ${isPUPN ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
          {/* Jumlah */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Users className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Jumlah</p>
              <p className="text-lg font-bold text-gray-800">{nominatifList.length}</p>
            </div>
          </div>
          {isPUPN ? (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Pokok</p>
                  <p className="text-sm font-bold text-emerald-700">{formatRupiah(totalPokok)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4.5 h-4.5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Denda</p>
                  <p className="text-sm font-bold text-orange-600">{formatRupiah(totalDenda)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-primary/20 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ReceiptText className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Piutang</p>
                  <p className="text-sm font-bold text-primary">{formatRupiah(totalNilai)}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Nilai</p>
                  <p className="text-sm font-bold text-emerald-700">{formatRupiah(totalNilai)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-primary/20 p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ReceiptText className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Sisa Utang</p>
                  <p className="text-sm font-bold text-primary">{formatRupiah(totalSisa)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Tabel / Empty state */}
        {nominatifList.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
            <div className="overflow-x-auto">
              {isPUPN ? (
                // ── TABEL PUPN ──
                <table className="min-w-[1100px] w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-10">No</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nama & Alamat</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">NIK / Pekerjaan</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Jenis & No. SKRD/STRD</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pokok</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Denda</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Upaya Penagihan</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(nominatifList as NominatifPUPN[]).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition group">
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-gray-300">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800 text-sm">{item.nama}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]" title={item.alamat}>{item.alamat || "—"}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600 mb-0.5">
                            <Hash className="w-3 h-3 text-gray-400" />{item.nik || "—"}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Briefcase className="w-3 h-3" />{item.pekerjaan || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 mb-1">{item.jenisPiutang}</span>
                          <div className="text-xs text-gray-400 space-y-0.5">
                            {item.noSkrd && <div>SKRD: {item.noSkrd}</div>}
                            {item.noStrd && <div>STRD: {item.noStrd}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-medium text-emerald-700">{formatRupiah(item.pokok)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-orange-600">{formatRupiah(item.denda)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-primary">{formatRupiah(item.total)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-500 max-w-[120px] truncate" title={item.upayaPenagihan}>{item.upayaPenagihan || "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                            <button onClick={() => { setEditingNominatif(item); setShowModal(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteNominatif(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">{formatRupiah(totalPokok)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-orange-600">{formatRupiah(totalDenda)}</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-primary">{formatRupiah(totalNilai)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                // ── TABEL NON-PUPN ──
                <table className="min-w-[1000px] w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-10">No</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nama & Alamat</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nilai Piutang</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tanggal</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Mata Uang</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pembayaran</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sisa Utang</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Keterangan</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(nominatifList as NominatifNonPUPN[]).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition group">
                        <td className="px-4 py-3 text-center">
                          <span className="text-xs font-bold text-gray-300">{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800 text-sm">{item.nama}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]" title={item.alamat}>{item.alamat || "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-semibold text-emerald-700">{formatRupiah(item.nilaiPiutang)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" /><span className="text-gray-500">Terjadi:</span> {item.tanggalTerjadi || "—"}</div>
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-red-300" /><span className="text-gray-500">Macet:</span> {item.tanggalJatuhTempo || "—"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">{item.mataUang || "IDR"}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.pembayaran.length > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium bg-primary/5 px-2 py-0.5 rounded-full">
                              <Banknote className="w-3 h-3" /> {item.pembayaran.length}x bayar
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-sm font-bold ${item.sisaUtang > 0 ? "text-primary" : "text-emerald-600"}`}>
                            {formatRupiah(item.sisaUtang)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-500 max-w-[120px] truncate" title={item.keterangan}>{item.keterangan || "—"}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                            <button onClick={() => { setEditingNominatif(item); setShowModal(true); }} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteNominatif(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition" title="Hapus">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">{formatRupiah(totalNilai)}</td>
                      <td colSpan={3}></td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-primary">{formatRupiah(totalSisa)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          </div>
        ) : (
          // ── Empty state ──
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">Belum ada penanggung utang</p>
            <p className="text-sm text-gray-400 mb-4">Klik tombol di bawah untuk menambahkan data pertama</p>
            <button
              onClick={() => { setEditingNominatif(null); setShowModal(true); }}
              className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark transition shadow-sm text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Tambah Penanggung Utang
            </button>
          </div>
        )}

        {/* Action bar bawah */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${nominatifList.length > 0 ? "bg-emerald-400" : "bg-gray-300"}`} />
            {nominatifList.length > 0
              ? <span><strong className="text-gray-700">{nominatifList.length}</strong> penanggung utang ditambahkan</span>
              : <span>Belum ada data</span>
            }
          </div>
          <div className="flex items-center gap-2">
            {/* Batalkan */}
            <button
              onClick={() => { if (confirm("Apakah Anda yakin ingin membatalkan? Semua data akan hilang.")) triggerDiscard(); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition"
            >
              <X className="w-4 h-4" /> Batalkan
            </button>
            {/* Simpan Draft */}
            <button
              onClick={() => saveDokumen("DRAFT")}
              disabled={nominatifList.length === 0}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                nominatifList.length === 0
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
              }`}
            >
              <Save className="w-4 h-4" /> Simpan Draft
            </button>
            {/* Kirim ke BPKAD */}
            <button
              onClick={submitPengajuan}
              disabled={nominatifList.length === 0}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition ${
                nominatifList.length === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-dark"
              }`}
            >
              <Send className="w-4 h-4" /> Kirim ke BPKAD
            </button>
          </div>
        </div>

        <FormPenanggungUtangModal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditingNominatif(null); }}
          onSubmit={handleSubmitModal}
          jalur={jalur!}
          initialData={editingNominatif}
        />
      </div>
    );
  }

  return null;
}