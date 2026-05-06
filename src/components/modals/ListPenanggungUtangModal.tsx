// components/modals/ListPenanggungUtangModal.tsx
"use client";

import { useState, useMemo } from "react";
import {
  X,
  FileText,
  Plus,
  Calendar,
  Hash,
  Users,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { DokumenInduk } from "@/components/contents/PengajuanPenghapusanPiutangContent";
import FormPenanggungUtangModal, {
  FormDataPUPN,
  FormDataNonPUPN,
} from "@/components/modals/FormPenanggungUtangModal";
import { formatRupiah } from "@/lib/format";

interface ListPenanggungUtangModalProps {
  isOpen: boolean;
  onClose: () => void;
  dokumen: DokumenInduk;
  nominatifList: (FormDataPUPN | FormDataNonPUPN)[];
  onTambahNominatif: (dokumenId: number, data: FormDataPUPN | FormDataNonPUPN) => void;
  onDeleteNominatif?: (dokumenId: number, nominatifId: number) => void;
  onEditNominatif?: (dokumenId: number, data: FormDataPUPN | FormDataNonPUPN) => void;
}

export default function ListPenanggungUtangModal({
  isOpen,
  onClose,
  dokumen,
  nominatifList,
  onTambahNominatif,
  onDeleteNominatif,
  onEditNominatif,
}: ListPenanggungUtangModalProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editData, setEditData] = useState<FormDataPUPN | FormDataNonPUPN | null>(null);

  if (!isOpen) return null;

  const isPUPN = dokumen.jenisPengajuan === "PUPN";

  const { totalPokok, totalDenda, totalNilai } = useMemo(() => {
    if (isPUPN) {
      let pokok = 0, denda = 0;
      (nominatifList as FormDataPUPN[]).forEach((item) => { pokok += item.pokok || 0; denda += item.denda || 0; });
      return { totalPokok: pokok, totalDenda: denda, totalNilai: pokok + denda };
    } else {
      let nilai = 0;
      (nominatifList as FormDataNonPUPN[]).forEach((item) => { nilai += item.nilaiPiutang || 0; });
      return { totalPokok: 0, totalDenda: 0, totalNilai: nilai };
    }
  }, [nominatifList, isPUPN]);

  const handleFormSubmit = (data: FormDataPUPN | FormDataNonPUPN) => {
    if (editData && onEditNominatif) onEditNominatif(dokumen.id, data);
    else onTambahNominatif(dokumen.id, data);
    setShowFormModal(false);
    setEditData(null);
  };

  const handleDelete = (item: FormDataPUPN | FormDataNonPUPN) => {
    const nominatifId = (item as any).id;
    if (nominatifId && window.confirm("Hapus data penanggung utang ini?")) {
      onDeleteNominatif?.(dokumen.id, nominatifId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in border border-gray-100">
          
          {/* Header putih bersih dengan informasi dokumen */}
          <div className="bg-white px-6 py-5 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-gray-800 leading-tight">{dokumen.judul}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                      <Hash className="w-3 h-3" /> #{dokumen.id}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                      <Calendar className="w-3 h-3" /> {dokumen.timestamp}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      isPUPN ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                    }`}>
                      {isPUPN ? "PUPN (PSBDT)" : "Non‑PUPN (PPDTO)"}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      dokumen.status === "SUBMITTED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {dokumen.status === "SUBMITTED" ? "Terkirim" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition p-1.5 rounded-full hover:bg-gray-50 flex-shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Strip statistik ringkas tanpa card */}
          <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-4 h-4 text-gray-400" />
              <span><strong className="text-gray-700">{nominatifList.length}</strong> penanggung utang</span>
            </div>
            {isPUPN && (
              <>
                <div className="flex items-center gap-2 text-gray-500">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span>Pokok <strong className="text-green-700">{formatRupiah(totalPokok)}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span>Denda <strong className="text-orange-700">{formatRupiah(totalDenda)}</strong></span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2 text-gray-500">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>Total <strong className="text-primary">{formatRupiah(totalNilai)}</strong></span>
            </div>
          </div>

          {/* Tabel menyatu tanpa container */}
          <div className="flex-1 overflow-y-auto">
            {nominatifList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-base font-medium text-gray-500 mb-1">Belum ada penanggung utang</h3>
                <p className="text-sm text-gray-400">Klik tombol di bawah untuk menambahkan data</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 sticky top-0 z-10">
                    {isPUPN ? (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Alamat</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">NIK</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Pekerjaan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Jenis Piutang</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">No SKRD</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">No STRD</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Pokok</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Denda</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Upaya</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Aksi</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">No</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Nama</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Alamat</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Nilai Piutang</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Tgl Terjadi</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Tgl Macet</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Mata Uang</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Saldo Utang</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Sisa Utang</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Keterangan</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Pembayaran</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Aksi</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isPUPN
                    ? (nominatifList as FormDataPUPN[]).map((item, idx) => (
                        <tr key={(item as any).id || idx} className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-700">{item.nama}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate" title={item.alamat}>{item.alamat}</td>
                          <td className="px-4 py-3 text-gray-500">{item.nik || "-"}</td>
                          <td className="px-4 py-3 text-gray-500">{item.pekerjaan || "-"}</td>
                          <td className="px-4 py-3 text-gray-500">{item.jenisPiutang}</td>
                          <td className="px-4 py-3 text-gray-500">{item.noSkrd || "-"}</td>
                          <td className="px-4 py-3 text-gray-500">{item.noStrd || "-"}</td>
                          <td className="px-4 py-3 text-right text-green-700 font-medium">{formatRupiah(item.pokok)}</td>
                          <td className="px-4 py-3 text-right text-orange-700">{formatRupiah(item.denda)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-primary">{formatRupiah(item.pokok + item.denda)}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate" title={item.upayaPenagihan}>{item.upayaPenagihan || "-"}</td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => { setEditData(item); setShowFormModal(true); }} className="text-gray-300 hover:text-primary p-1 rounded transition" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(item)} className="text-gray-300 hover:text-red-500 p-1 rounded transition" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    : (nominatifList as FormDataNonPUPN[]).map((item, idx) => {
                        const saldo = (item as any).saldoUtang ?? item.nilaiPiutang;
                        const sisa = (item as any).sisaUtang ?? item.nilaiPiutang;
                        return (
                          <tr key={(item as any).id || idx} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-700">{item.nama}</td>
                            <td className="px-4 py-3 text-gray-500 max-w-[140px] truncate" title={item.alamat}>{item.alamat}</td>
                            <td className="px-4 py-3 text-right text-green-700 font-medium">{formatRupiah(item.nilaiPiutang)}</td>
                            <td className="px-4 py-3 text-gray-500">{item.tanggalTerjadi || "-"}</td>
                            <td className="px-4 py-3 text-gray-500">{item.tanggalJatuhTempo || "-"}</td>
                            <td className="px-4 py-3 text-gray-500">{item.mataUang || "IDR"}</td>
                            <td className="px-4 py-3 text-right text-gray-700">{formatRupiah(saldo)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-primary">{formatRupiah(sisa)}</td>
                            <td className="px-4 py-3 text-gray-500 max-w-[120px] truncate" title={item.keterangan}>{item.keterangan || "-"}</td>
                            <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate" title={item.pembayaran?.map(p => `${p.tanggal}: Rp${p.nilai.toLocaleString()}`).join(", ")}>
                              {item.pembayaran?.length ? item.pembayaran.map(p => `${p.tanggal}: Rp${p.nilai.toLocaleString()}`).join(", ") : "-"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => { setEditData(item); setShowFormModal(true); }} className="text-gray-300 hover:text-primary p-1 rounded transition" title="Edit"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(item)} className="text-gray-300 hover:text-red-500 p-1 rounded transition" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer dengan aksi */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
            <span className="text-xs text-gray-400">{nominatifList.length} data</span>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">Tutup</button>
              <button
                onClick={() => { setEditData(null); setShowFormModal(true); }}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Tambah Penanggung Utang
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFormModal && (
        <FormPenanggungUtangModal
          isOpen={showFormModal}
          onClose={() => { setShowFormModal(false); setEditData(null); }}
          onSubmit={handleFormSubmit}
          jalur={isPUPN ? "PUPN" : "NON-PUPN"}
          initialData={editData}
        />
      )}
    </>
  );
}