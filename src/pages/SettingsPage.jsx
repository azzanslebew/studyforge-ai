import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Key,
  Database,
  Sparkles,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Check,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function SettingsPage() {
  const { profile, updateProfile, aiStatus, checkAI, resetToEmpty, resetToDemo } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'Universitas (S1)');
  const [university, setUniversity] = useState(profile?.university || '');
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(profile?.weeklyGoalMinutes || 300);
  const [explanationStyle, setExplanationStyle] = useState(profile?.explanationStyle || 'Lengkap & Akademis');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [confirmEmptyModal, setConfirmEmptyModal] = useState(false);
  const [confirmResetModal, setConfirmResetModal] = useState(false);
  const [checkingAi, setCheckingAi] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateProfile({
      displayName,
      educationLevel,
      university,
      weeklyGoalMinutes: Number(weeklyGoalMinutes),
      explanationStyle,
    });
    setSavedSuccess(true);
    showToast('Pengaturan profil berhasil disimpan!', 'success');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestAi = async () => {
    setCheckingAi(true);
    await checkAI();
    setCheckingAi(false);
    showToast('Pemeriksaan koneksi AI selesai.', 'info');
  };

  const handleEmptyData = async () => {
    await resetToEmpty();
    setConfirmEmptyModal(false);
    showToast('Seluruh data berhasil dikosongkan. Anda dapat mulai belajar dari awal!', 'success');
  };

  const handleReloadDemo = async () => {
    await resetToDemo();
    setConfirmResetModal(false);
    showToast('Data kurikulum demo berhasil dimuat ulang.', 'success');
  };

  const handleExportBackup = async () => {
    try {
      const [l, f, q, qa, ps] = await Promise.all([
        db.lessons.toArray(),
        db.flashcards.toArray(),
        db.quizzes.toArray(),
        db.quizAttempts.toArray(),
        db.plannerSessions.toArray(),
      ]);

      const backupObj = {
        exportedAt: new Date().toISOString(),
        profile,
        lessons: l,
        flashcards: f,
        quizzes: q,
        quizAttempts: qa,
        plannerSessions: ps
      };

      const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `StudyForge_Backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Cadangan data berhasil diunduh.', 'success');
    } catch (err) {
      console.error('Backup error:', err);
      showToast('Gagal mengekspor data cadangan.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan & Konfigurasi</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Kelola profil pengguna, koneksi Google Gemini AI, dan penyimpanan data lokal.
        </p>
      </div>

      {/* 1. Profile Settings Form */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-5 h-5 text-brand-600" />
          <h2 className="font-bold text-sm text-slate-900">Profil Pelajar & Preferensi</h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap / Panggilan"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="misal: Ahmad Faiz"
              required
            />

            <Select
              label="Jenjang Pendidikan"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <option value="SMA / SMK / MA">SMA / SMK / MA</option>
              <option value="Universitas (D3 / D4)">Universitas (D3 / D4)</option>
              <option value="Universitas (S1)">Universitas (S1)</option>
              <option value="Pascasarjana (S2 / S3)">Pascasarjana (S2 / S3)</option>
              <option value="Pembelajar Mandiri">Pembelajar Mandiri</option>
            </Select>

            <Input
              label="Universitas / Sekolah"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="misal: Institut Teknologi Bandung"
            />

            <Select
              label="Target Belajar Mingguan"
              value={weeklyGoalMinutes}
              onChange={(e) => setWeeklyGoalMinutes(Number(e.target.value))}
            >
              <option value={120}>2 Jam / Minggu (Santai)</option>
              <option value={240}>4 Jam / Minggu (Sedang)</option>
              <option value={300}>5 Jam / Minggu (Fokus)</option>
              <option value={420}>7 Jam / Minggu (Intensif)</option>
            </Select>
          </div>

          <Select
            label="Gaya Penjelasan AI Tutor"
            value={explanationStyle}
            onChange={(e) => setExplanationStyle(e.target.value)}
          >
            <option value="Lengkap & Akademis">Lengkap & Akademis (Mendalam dengan teori & literatur)</option>
            <option value="Sederhana & Mudah Dipahami">Sederhana & Mudah Dipahami (Analogi lugas tanpa jargon rumit)</option>
            <option value="Langkah demi Langkah">Langkah demi Langkah (Sistematis & prosedural)</option>
            <option value="Berdasarkan Contoh Nyata">Berdasarkan Contoh Nyata (Banyak studi kasus industri)</option>
          </Select>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" size="md" icon={savedSuccess ? Check : undefined}>
              {savedSuccess ? 'Tersimpan!' : 'Simpan Perubahan Profil'}
            </Button>
          </div>
        </form>
      </Card>

      {/* 2. Google Gemini AI Integration & Status Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-brand-600" />
            <h2 className="font-bold text-sm text-slate-900">Integrasi Google Gemini AI</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            aiStatus.hasKey ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {aiStatus.hasKey ? `Live AI (${aiStatus.model})` : 'Mode Demo Cerdas'}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border text-xs space-y-2 leading-relaxed ${
          aiStatus.hasKey ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>
              {aiStatus.hasKey ? 'Kunci API Gemini Terdeteksi di Server' : 'Aplikasi Beroperasi Penuh dalam Mode Demo Cerdas'}
            </span>
          </div>
          <p>
            {aiStatus.hasKey
              ? `API Key terpasang secara aman pada server backend Node.js (tidak terekspos di browser). Permintaan generasi materi, tutor, flashcard, dan kuis dikirim langsung ke Google Gemini.`
              : `Aplikasi siap digunakan tanpa API Key. Generator kurikulum lokal bawaan menyediakan jawaban materi dan kuis simulasi berbobot akademis.`}
          </p>
        </div>

        {!aiStatus.hasKey && (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="font-semibold text-slate-900">Langkah Konfigurasi API Key Anda Sendiri:</div>
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
              <li>Buka file <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">.env</code> pada folder root proyek</li>
              <li>Masukkan: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-900">GEMINI_API_KEY=AIzaSy...</code></li>
              <li>Simpan dan klik tombol Uji Koneksi di bawah.</li>
            </ol>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" loading={checkingAi} onClick={handleTestAi}>
            Uji Ulang Koneksi AI
          </Button>
        </div>
      </Card>

      {/* 3. Local Persistence & Database Management */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Database className="w-5 h-5 text-brand-600" />
          <h2 className="font-bold text-sm text-slate-900">Penyimpanan & Manajemen Data Lokal</h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Seluruh data materi, kartu flashcard, riwayat kuis, dan jadwal belajar Anda disimpan secara aman di peramban menggunakan <strong>IndexedDB (Dexie)</strong>.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmEmptyModal(true)}>
            Kosongkan Total (Mulai dari Nol)
          </Button>

          <Button variant="outline" size="sm" icon={RotateCcw} onClick={() => setConfirmResetModal(true)}>
            Muat Ulang Contoh Data Demo
          </Button>

          <Button variant="outline" size="sm" icon={Download} onClick={handleExportBackup}>
            Unduh Cadangan JSON
          </Button>
        </div>
      </Card>

      {/* Modal 1: Confirm Completely Empty */}
      <Modal
        isOpen={confirmEmptyModal}
        onClose={() => setConfirmEmptyModal(false)}
        title="Kosongkan Semua Data (Mulai dari Nol)?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin mengosongkan seluruh database?
          </p>
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
            <strong>Apa yang akan terjadi:</strong>
            <ul className="list-disc list-inside space-y-0.5 mt-1">
              <li>Semua materi, folder, dan catatan akan terhapus.</li>
              <li>Semua kartu flashcard dan riwayat kuis akan terhapus.</li>
              <li>Jadwal belajar dan analitik akan bersih 0.</li>
              <li>Level direset ke Level 1 (0 XP, streak 1).</li>
              <li>Data demo bawaan <strong>tidak akan dimuat lagi</strong>.</li>
            </ul>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmEmptyModal(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleEmptyData}>
              Ya, Kosongkan Semuanya
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal 2: Confirm Reload Demo Data */}
      <Modal
        isOpen={confirmResetModal}
        onClose={() => setConfirmResetModal(false)}
        title="Muat Ulang Contoh Data Demo?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600 leading-relaxed">
            Tindakan ini akan mengatur ulang database dan memuat kembali contoh materi perkuliahan Indonesia (Struktur Data BST, Biologi Molekuler DNA, dan Ekonomi Makro).
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmResetModal(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleReloadDemo}>
              Ya, Muat Ulang Demo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
