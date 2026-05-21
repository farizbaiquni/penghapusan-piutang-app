// components/modals/UnsavedChangesModal.tsx
"use client";

import { AlertTriangle, Save, Trash2, X } from "lucide-react";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  judul?: string;
  nominatifCount?: number;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesModal({
  isOpen,
  judul,
  nominatifCount = 0,
  onSaveDraft,
  onDiscard,
  onCancel,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Data Pengajuan Belum Tersimpan</h2>
              <p className="text-xs text-gray-400 mt-0.5">Anda ingin meninggalkan halaman ini</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-300 hover:text-gray-500 transition p-1 rounded-full hover:bg-gray-100 -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Preview data yang akan hilang */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wider">Data yang sedang dikerjakan:</p>
            <div className="space-y-1.5">
              {judul ? (
                <div className="flex items-center gap-2 text-sm text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span>Judul: <span className="font-medium">"{judul}"</span></span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-amber-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-amber-600 italic">Judul belum diisi</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span>
                  Penanggung utang:{" "}
                  <span className="font-medium">{nominatifCount} data</span>
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Jika Anda meninggalkan halaman ini tanpa menyimpan, seluruh data di atas akan{" "}
            <span className="font-semibold text-red-500">hilang permanen</span>.
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-2">
          {/* Simpan Draft */}
          <button
            onClick={onSaveDraft}
            disabled={!judul}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm
              ${judul
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Save className="w-4 h-4" />
            Simpan sebagai Draft
          </button>

          {/* Buang */}
          <button
            onClick={onDiscard}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
          >
            <Trash2 className="w-4 h-4" />
            Buang & Lanjut
          </button>
        </div>

        {/* Kembali ke form */}
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
          <button
            onClick={onCancel}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition font-medium"
          >
            ← Kembali ke form pengajuan
          </button>
        </div>
      </div>
    </div>
  );
}