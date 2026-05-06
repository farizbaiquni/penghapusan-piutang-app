"use client";

import { useState } from "react";
import {
  CheckCircle,
  AlertCircle,
  Info,
  Award,
  Plus,
  Trash2,
  Users,
  FileText,
} from "lucide-react";
import FormPenanggungUtangModal, {
  FormDataPUPN,
  FormDataNonPUPN,
} from "./FormPenanggungUtangModal";

interface PengajuanPenghapusanPiutangProps {
  role: "SKPD" | "BPKAD" | "INSPEKTORAT";
}

type DokumenInduk = {
  id: number;
  judul: string;
  jenisPengajuan: "PUPN" | "NON-PUPN";
  timestamp: string;
  nominatifIds: number[];
  status: "DRAFT" | "SUBMITTED";
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

export default function PengajuanPenghapusanPiutang({
  role,
}: PengajuanPenghapusanPiutangProps) {
  // Wizard state
  const [step, setStep] = useState(1);
  const [jalur, setJalur] = useState<"PUPN" | "NON-PUPN" | null>(null);
  const [answers, setAnswers] = useState({ q1: "", q2: "" });

  // Dokumen induk
  const [dokumenInduk, setDokumenInduk] = useState<DokumenInduk | null>(null);
  const [judulDokumen, setJudulDokumen] = useState("");

  // Nominatif
  const [nominatifPUPNList, setNominatifPUPNList] = useState<NominatifPUPN[]>([]);
  const [nominatifNonPUPNList, setNominatifNonPUPNList] = useState<
    NominatifNonPUPN[]
  >([]);
  const [showModal, setShowModal] = useState(false);
  const [editingNominatif, setEditingNominatif] = useState<any>(null);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // =============== WIZARD LOGIC ===============
  const answerQ1 = (ans: string) => {
    setAnswers({ ...answers, q1: ans });
    if (ans === "YA") {
      setJalur("NON-PUPN");
      setStep(2);
    } else {
      setStep(1.5);
    }
  };

  const answerQ2 = (ans: string) => {
    setAnswers({ ...answers, q2: ans });
    if (ans === "YA") {
      setJalur("NON-PUPN");
    } else {
      setJalur("PUPN");
    }
    setStep(2);
  };

  const handleSaveDokumenInduk = () => {
    if (!judulDokumen.trim()) {
      alert("Judul dokumen wajib diisi");
      return;
    }
    const newDokumen: DokumenInduk = {
      id: Date.now(),
      judul: judulDokumen,
      jenisPengajuan: jalur!,
      timestamp: new Date().toLocaleString(),
      nominatifIds: [],
      status: "DRAFT",
    };
    setDokumenInduk(newDokumen);
    setStep(3);
  };

  const addNominatifPUPN = (data: FormDataPUPN) => {
    const total = data.pokok + data.denda;
    const newNom: NominatifPUPN = {
      id: Date.now(),
      ...data,
      total,
      dokumenId: dokumenInduk!.id,
      dokumenFiles: data.dokumen,
    };
    setNominatifPUPNList([...nominatifPUPNList, newNom]);
    setShowModal(false);
  };

  const addNominatifNonPUPN = (data: FormDataNonPUPN) => {
    const newNom: NominatifNonPUPN = {
      id: Date.now(),
      ...data,
      pembayaran: [],
      saldoUtang: data.nilaiPiutang,
      sisaUtang: data.nilaiPiutang,
      dokumenId: dokumenInduk!.id,
      dokumenFiles: data.dokumen,
    };
    setNominatifNonPUPNList([...nominatifNonPUPNList, newNom]);
    setShowModal(false);
  };

  const updateNominatifPUPN = (data: FormDataPUPN) => {
    if (editingNominatif) {
      const updated = {
        ...editingNominatif,
        ...data,
        total: data.pokok + data.denda,
        dokumenFiles: data.dokumen,
      };
      setNominatifPUPNList(
        nominatifPUPNList.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingNominatif(null);
      setShowModal(false);
    }
  };

  const updateNominatifNonPUPN = (data: FormDataNonPUPN) => {
    if (editingNominatif) {
      const updated = { ...editingNominatif, ...data, dokumenFiles: data.dokumen };
      setNominatifNonPUPNList(
        nominatifNonPUPNList.map((item) =>
          item.id === updated.id ? updated : item
        )
      );
      setEditingNominatif(null);
      setShowModal(false);
    }
  };

  const handleSubmitModal = (data: any) => {
    if (editingNominatif) {
      if (jalur === "PUPN") updateNominatifPUPN(data);
      else updateNominatifNonPUPN(data);
    } else {
      if (jalur === "PUPN") addNominatifPUPN(data);
      else addNominatifNonPUPN(data);
    }
  };

  const deleteNominatif = (id: number) => {
    if (jalur === "PUPN")
      setNominatifPUPNList(nominatifPUPNList.filter((i) => i.id !== id));
    else setNominatifNonPUPNList(nominatifNonPUPNList.filter((i) => i.id !== id));
  };

  const submitPengajuan = () => {
    const nominatifCount =
      jalur === "PUPN" ? nominatifPUPNList.length : nominatifNonPUPNList.length;
    if (dokumenInduk && nominatifCount === 0) {
      alert("Tambahkan minimal satu data nominatif penanggung utang");
      return;
    }
    setDokumenInduk({ ...dokumenInduk!, status: "SUBMITTED" });
    alert(
      `Pengajuan berhasil dikirim ke BPKAD!\nID: ${dokumenInduk?.id}\nJalur: ${jalur}`
    );
  };

  // ======================= RENDER WIZARD STEP 1 =======================
  if (step === 1) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header: teks hitam di atas gradien biru */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                1
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Kriteria Piutang
                </h2>
                <p className="text-xs sm:text-sm text-gray-700">
                  Berdasarkan Peraturan Bupati Kendal
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="bg-blue-50 border-l-4 border-primary rounded-lg p-3 sm:p-4 mb-6 flex gap-2 sm:gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-gray-700">
                <p className="font-semibold">Acuan Perbup:</p>
                <p>
                  Non-PUPN (PPDTO) jika sisa utang ≤ Rp8.000.000 & tidak ada
                  jaminan bernilai ekonomis, ATAU piutang tidak pasti secara
                  hukum.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">
                  Pertanyaan 1
                </span>
              </div>
              <p className="text-gray-800 text-sm sm:text-base mb-4">
                Apakah{" "}
                <strong className="text-primary">
                  sisa utang ≤ Rp8.000.000 atau setara
                </strong>{" "}
                dan{" "}
                <strong className="text-primary">
                  tidak ada barang jaminan
                </strong>{" "}
                yang diserahkan atau barang jaminan{" "}
                <strong className="text-primary">
                  tidak mempunyai nilai ekonomis
                </strong>
                ?
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => answerQ1("YA")}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm sm:text-base"
                >
                  <CheckCircle className="w-4 h-4" /> YA → Non-PUPN
                </button>
                <button
                  onClick={() => answerQ1("TIDAK")}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 text-sm sm:text-base"
                >
                  <AlertCircle className="w-4 h-4" /> TIDAK → Lanjut
                </button>
              </div>
              <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs text-gray-600 border">
                <p className="font-medium">
                  📌 Nilai ekonomis: biaya penjualan &gt; hasil penjualan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================= STEP 1.5 =======================
  if (step === 1.5) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header: teks hitam di atas gradien biru */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                2
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Ketidakpastian Hukum
                </h2>
                <p className="text-xs sm:text-sm text-gray-800">
                  Lampiran II A.5 Perbup
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4 mb-6">
              <p className="font-semibold text-amber-800">
                Pertanyaan 2 dari 2
              </p>
              <p className="text-gray-800 text-sm sm:text-base mt-1">
                Apakah Piutang Daerah{" "}
                <strong className="text-primary">
                  tidak memenuhi syarat
                </strong>{" "}
                untuk diserahkan kepada PUPN, yaitu{" "}
                <strong className="text-primary">
                  adanya dan besarnya tidak pasti secara hukum
                </strong>
                ?
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="font-semibold flex items-center gap-2 text-sm">
                Kriteria tidak pasti hukum:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm mt-2 text-gray-700 ml-2 space-y-1">
                <li>a. Tidak didukung dokumen sumber yang memadai</li>
                <li>b. Jumlah tidak dapat dipastikan</li>
                <li>c. Masih sengketa peradilan</li>
                <li>d. Telah ditolak PUPN</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => answerQ2("YA")}
                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                YA → Non-PUPN
              </button>
              <button
                onClick={() => answerQ2("TIDAK")}
                className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark flex items-center gap-2"
              >
                TIDAK → PUPN
              </button>
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-5 text-sm text-primary hover:underline"
            >
              ← Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ======================= STEP 2 : DOKUMEN INDUK =======================
  if (step === 2) {
    const jalurText =
      jalur === "PUPN"
        ? "PUPN (PSBDT) - Melalui PUPN"
        : "Non-PUPN (PPDTO) - Melalui PPKD";
    const bgColor =
      jalur === "PUPN"
        ? "bg-blue-50 border-blue-200"
        : "bg-green-50 border-green-200";
    return (
      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header: teks hitam */}
          <div className="bg-gradient-to-r from-primary to-primary-dark px-4 sm:px-6 py-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Buat Dokumen Pengajuan Penghapusan Piutang
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <div
              className={`p-3 sm:p-4 rounded-lg mb-6 border ${bgColor} flex items-center gap-3`}
            >
              <Award className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold text-sm sm:text-base">
                  Jalur:{" "}
                  <strong>
                    {jalur === "PUPN" ? "PUPN (PSBDT)" : "Non-PUPN (PPDTO)"}
                  </strong>
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {jalur === "PUPN"
                    ? "Piutang akan dilimpahkan ke PUPN."
                    : "Piutang diproses intern oleh PPKD."}
                </p>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Dokumen <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={judulDokumen}
                onChange={(e) => setJudulDokumen(e.target.value)}
                placeholder="Contoh: Pengajuan Penghapusan Piutang Retribusi Dinas Pendidikan"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveDokumenInduk}
                className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Simpan & Lanjut
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setJalur(null);
                }}
                className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-lg"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ======================= STEP 3 : NOMINATIF =======================
  if (step === 3 && dokumenInduk) {
    const isPUPN = jalur === "PUPN";
    const nominatifList = isPUPN ? nominatifPUPNList : nominatifNonPUPNList;

    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header dokumen induk - responsive */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-800 break-words">
                {dokumenInduk.judul}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-gray-500">
                <span>ID: #{dokumenInduk.id}</span>
                <span>📅 {dokumenInduk.timestamp}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    isPUPN
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isPUPN ? "PUPN" : "Non-PUPN"}
                </span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  DRAFT
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingNominatif(null);
                setShowModal(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Tambah Penanggung Utang
            </button>
          </div>
        </div>

        {/* Daftar nominatif dengan tabel scroll horizontal */}
        {nominatifList.length > 0 ? (
          <div className="bg-white rounded-xl shadow border mb-6 overflow-x-auto">
            <table className="min-w-[600px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">No</th>
                  <th className="px-3 py-2 text-left">Nama</th>
                  <th className="px-3 py-2 text-left">Alamat</th>
                  <th className="px-3 py-2 text-right">Nilai</th>
                  <th className="px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {nominatifList.map((item, idx) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium break-words">
                      {item.nama}
                    </td>
                    <td className="px-3 py-2 text-gray-600 break-words">
                      {item.alamat}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-primary">
                      {isPUPN
                        ? formatRupiah((item as NominatifPUPN).total)
                        : formatRupiah(
                            (item as NominatifNonPUPN).nilaiPiutang
                          )}
                    </td>
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingNominatif(item);
                          setShowModal(true);
                        }}
                        className="text-primary hover:text-primary-dark mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteNominatif(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow border p-8 text-center text-gray-400 mb-6">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>
              Belum ada data penanggung utang. Klik tombol di atas untuk
              menambah.
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={submitPengajuan}
            disabled={nominatifList.length === 0}
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              nominatifList.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            Kirim Pengajuan ke BPKAD
          </button>
        </div>

        {/* Modal Form Penanggung Utang */}
        <FormPenanggungUtangModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingNominatif(null);
          }}
          onSubmit={handleSubmitModal}
          jalur={jalur!}
          initialData={editingNominatif}
        />
      </div>
    );
  }

  return null;
}