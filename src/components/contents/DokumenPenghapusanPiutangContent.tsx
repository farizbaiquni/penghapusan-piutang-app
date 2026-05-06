// components/contents/DokumenPenghapusanPiutangContent.tsx
"use client";

import { useState } from "react";
import { FileText, Trash2, Edit, Eye } from "lucide-react";
import { DokumenInduk } from "./PengajuanPenghapusanPiutangContent";
import FormPenanggungUtangModal, {
  FormDataPUPN,
  FormDataNonPUPN,
} from "@/components/modals/FormPenanggungUtangModal";
import ListPenanggungUtangModal from "@/components/modals/ListPenanggungUtangModal";

interface DokumenPenghapusanPiutangContentProps {
  dokumenIndukList: DokumenInduk[];
  nominatifMap: Record<number, (FormDataPUPN | FormDataNonPUPN)[]>;
  onDeleteDokumen: (id: number) => void;
  onAddNominatif: (dokumenId: number, data: FormDataPUPN | FormDataNonPUPN) => void;
}

export default function DokumenPenghapusanPiutangContent({
  dokumenIndukList,
  nominatifMap,
  onDeleteDokumen,
  onAddNominatif,
}: DokumenPenghapusanPiutangContentProps) {
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DokumenInduk | null>(null);
  
  // State untuk ListPenanggungUtangModal
  const [showListModal, setShowListModal] = useState(false);
  const [listModalDoc, setListModalDoc] = useState<DokumenInduk | null>(null);

  // --- Tombol aksi di tabel ---
  
  // Klik ikon "mata" → buka ListPenanggungUtangModal
  const handleLihatList = (doc: DokumenInduk) => {
    setListModalDoc(doc);
    setShowListModal(true);
  };

  // Klik ikon "edit" (tambah nominatif langsung) → buka FormPenanggungUtangModal
  const handleTambahNominatifLangsung = (doc: DokumenInduk) => {
    setSelectedDoc(doc);
    setShowTambahModal(true);
  };

  // Hapus dokumen
  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      onDeleteDokumen(id);
    }
  };

  // Submit dari FormPenanggungUtangModal (tambah langsung dari tabel)
  const handleSubmitModal = (data: FormDataPUPN | FormDataNonPUPN) => {
    if (selectedDoc) {
      onAddNominatif(selectedDoc.id, data);
      setShowTambahModal(false);
      setSelectedDoc(null);
    }
  };

  // Submit dari ListPenanggungUtangModal (tambah dari dalam list)
  const handleSubmitFromListModal = (dokumenId: number, data: FormDataPUPN | FormDataNonPUPN) => {
    onAddNominatif(dokumenId, data);
    // List modal tetap terbuka, form modal akan menutup sendiri di dalam ListPenanggungUtangModal
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Dokumen Penghapusan Piutang
      </h1>

      <div className="bg-white rounded-md border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">No</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Judul</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Jenis</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Nominatif</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dokumenIndukList.map((doc, idx) => {
              const nominatifCount = (nominatifMap[doc.id] || []).length;
              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">{idx + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800 break-words">{doc.judul}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      doc.jenisPengajuan === "PUPN" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {doc.jenisPengajuan === "PUPN" ? "PUPN (PSBDT)" : "Non-PUPN (PPDTO)"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">{nominatifCount}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      doc.status === "SUBMITTED" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {doc.status === "SUBMITTED" ? "Terkirim" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Lihat Daftar Nominatif → ListPenanggungUtangModal */}
                      <button
                        onClick={() => handleLihatList(doc)}
                        className="text-gray-500 hover:text-primary"
                        title="Lihat Daftar Nominatif"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {/* Tambah Nominatif Langsung → FormPenanggungUtangModal */}
                      <button
                        onClick={() => handleTambahNominatifLangsung(doc)}
                        className="text-primary hover:text-primary-dark"
                        title="Tambah Nominatif"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {/* Hapus Dokumen */}
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Form Penanggung Utang (dipanggil langsung dari tabel) */}
      {selectedDoc && (
        <FormPenanggungUtangModal
          isOpen={showTambahModal}
          onClose={() => { 
            setShowTambahModal(false); 
            setSelectedDoc(null); 
          }}
          onSubmit={handleSubmitModal}
          jalur={selectedDoc.jenisPengajuan === "PUPN" ? "PUPN" : "NON-PUPN"}
          initialData={null}
        />
      )}

      {/* Modal List Penanggung Utang (dipanggil dari ikon mata) */}
      {listModalDoc && (
        <ListPenanggungUtangModal
          isOpen={showListModal}
          onClose={() => {
            setShowListModal(false);
            setListModalDoc(null);
          }}
          dokumen={listModalDoc}
          nominatifList={nominatifMap[listModalDoc.id] || []}
          onTambahNominatif={handleSubmitFromListModal}
        />
      )}
    </div>
  );
}