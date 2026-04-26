"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  User,
  Database,
  Palette,
  Save,
} from "lucide-react";

type SettingsContentProps = {
  useShortFormat: boolean;
  setUseShortFormat: (value: boolean) => void;
};

export default function SettingsContent({
  useShortFormat,
  setUseShortFormat,
}: SettingsContentProps) {
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
        <p className="text-sm text-gray-500 mt-1">
          Konfigurasi aplikasi dan preferensi pengguna
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              Preferensi Tampilan
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Format Angka Sederhana
                </p>
                <p className="text-xs text-gray-400">
                  Tampilkan angka dalam format Juta/Miliar/Triliun
                </p>
              </div>
              <button
                onClick={() => setUseShortFormat(!useShortFormat)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  useShortFormat ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useShortFormat ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              Notifikasi
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Notifikasi Desktop
                </p>
                <p className="text-xs text-gray-400">
                  Terima notifikasi saat ada aktivitas baru
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto Save</p>
                <p className="text-xs text-gray-400">
                  Simpan data secara otomatis
                </p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoSave ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoSave ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
          <div className="border-b border-gray-200 px-5 py-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Informasi Aplikasi
            </h3>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Versi Aplikasi</span>
              <span className="text-sm text-gray-700">v2.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">Terakhir Diperbarui</span>
              <span className="text-sm text-gray-700">26 April 2026</span>
            </div>
            <div className="flex justify-between py-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">Developer</span>
              <span className="text-sm text-gray-700">
                Dinas Pendapatan Daerah Kab. Kendal
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition shadow-sm">
            <Save className="w-4 h-4" />
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
}
