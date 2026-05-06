"use client";

import { UsulanPiutang } from "@/lib/pdfGenerator";
import {
  Users,
  DollarSign,
  AlertCircle,
  CreditCard,
  FileText,
  TrendingUp,
  Calendar,
} from "lucide-react";

type DashboardContentProps = {
  usulanList?: UsulanPiutang[];
  formatRupiah?: (angka: number) => string;
  useShortFormat?: boolean;
  role?: "SKPD" | "BPKAD" | "INSPEKTORAT";
};

export default function DashboardContent({
  usulanList = [],
  formatRupiah,
  useShortFormat = true,
  role = "SKPD",
}: DashboardContentProps) {
  // Helper format rupiah jika tidak disediakan dari parent
  const formatRupiahLocal = (angka: number): string => {
    if (useShortFormat) {
      if (angka === 0) return "Rp 0";
      const value = Math.abs(angka);
      if (value >= 1_000_000_000_000) return `Rp ${(value / 1_000_000_000_000).toFixed(2)} T`;
      if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(2)} M`;
      if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(2)} Jt`;
      if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(2)} Rb`;
      return `Rp ${value.toLocaleString("id-ID")}`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const displayFormat = formatRupiah || formatRupiahLocal;

  const totalPokok = usulanList.reduce((sum, item) => sum + item.pokok, 0);
  const totalDenda = usulanList.reduce((sum, item) => sum + item.denda, 0);
  const totalKeseluruhan = usulanList.reduce(
    (sum, item) => sum + item.total,
    0,
  );

  const bulanIni = new Date().toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const statPerJenis = usulanList.reduce(
    (acc, item) => {
      acc[item.jenisPiutang] = (acc[item.jenisPiutang] || 0) + item.total;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan dan statistik usulan penghapusan piutang daerah - Role:{" "}
          {role === "SKPD" && "SKPD Teknis"}
          {role === "BPKAD" && "BPKAD / PPKD"}
          {role === "INSPEKTORAT" && "Inspektorat Daerah"}
        </p>
      </div>

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
            <div className="bg-primary-50 p-2 rounded-md shrink-0 ml-3">
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
              <p className="text-xl font-bold text-green-700 mt-1">
                {displayFormat(totalPokok)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Nilai pokok piutang</p>
            </div>
            <div className="bg-green-50 p-2 rounded-md shrink-0 ml-3">
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
              <p className="text-xl font-bold text-orange-700 mt-1">
                {displayFormat(totalDenda)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Sanksi administrasi</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-md shrink-0 ml-3">
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
              <p className="text-xl font-bold text-primary mt-1">
                {displayFormat(totalKeseluruhan)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Pokok + Denda</p>
            </div>
            <div className="bg-primary-50 p-2 rounded-md shrink-0 ml-3">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Statistik per Jenis Piutang
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {Object.entries(statPerJenis).map(([jenis, nilai]) => (
              <div key={jenis} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{jenis}</span>
                <span className="text-sm font-semibold text-primary">
                  {displayFormat(nilai)}
                </span>
              </div>
            ))}
            {Object.keys(statPerJenis).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Belum ada data
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Informasi Periode
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Periode Laporan</span>
              <span className="text-sm font-medium text-gray-700">
                {bulanIni}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Total Data Usulan</span>
              <span className="text-sm font-medium text-gray-700">
                {usulanList.length} usulan
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">
                Rata-rata per Usulan
              </span>
              <span className="text-sm font-medium text-primary">
                {displayFormat(totalKeseluruhan / (usulanList.length || 1))}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-md border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Usulan Terbaru
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  No
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Nama WP
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                  Jenis Piutang
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {usulanList.slice(0, 5).map((item) => (
                <tr key={item.no} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-gray-500">{item.no}</td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-800">
                    {item.namaWp}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {item.jenisPiutang}
                  </td>
                  <td className="px-4 py-2 text-right text-xs font-semibold text-primary">
                    {displayFormat(item.total)}
                  </td>
                </tr>
              ))}
              {usulanList.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Belum ada usulan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}