import React, { useState } from 'react';
import { Sparkles, Info, CheckCircle2, Key, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from './Modal';
import { Button } from './Button';

export function AiStatusBadge() {
  const { aiStatus, checkAI } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkAI();
    setRefreshing(false);
  };

  const isLive = aiStatus.hasKey;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 active:scale-95 ${
          isLive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
        }`}
        title="Klik untuk melihat status integrasi AI"
      >
        <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isLive ? `AI Live (${aiStatus.model})` : 'Mode Demo Cerdas'}</span>
      </button>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Status Koneksi Google Gemini AI"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <div className={`p-4 rounded-2xl border ${isLive ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
            <div className="flex items-center gap-2 font-semibold">
              {isLive ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Info className="w-5 h-5 text-amber-600" />}
              <span>{isLive ? 'Google Gemini AI Terhubung' : 'Aplikasi Berjalan dalam Mode Demo'}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed opacity-90">
              {isLive
                ? `StudyForge AI aktif menggunakan model ${aiStatus.model} melalui server backend yang aman.`
                : 'Kunci API Gemini belum terdeteksi di file .env. Seluruh fitur (Rangkuman, Flashcard, Kuis, Tutor) tetap berfungsi 100% menggunakan generator edukasi bawaan.'}
            </p>
          </div>

          {!isLive && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Key className="w-4 h-4 text-brand-600" />
                <span>Cara Mengaktifkan Live Gemini AI:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed">
                <li>
                  Dapatkan API Key gratis di{' '}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 hover:underline font-medium inline-flex items-center gap-0.5"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Buka file <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">.env</code> di root folder proyek</li>
                <li>
                  Isi variabel: <br />
                  <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900 mt-1 block">
                    GEMINI_API_KEY=AIzaSy...
                  </code>
                </li>
                <li>Restart server backend atau klik periksa ulang status di bawah</li>
              </ol>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Tutup
            </Button>
            <Button variant="primary" size="sm" loading={refreshing} onClick={handleRefresh}>
              Periksa Ulang
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
