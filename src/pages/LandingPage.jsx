import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Bot,
  Layers,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Brain,
  Zap,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Navbar } from '../components/layout/Navbar';

export function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: FileText,
      title: 'AI Study Notes',
      desc: 'Ubah materi kuliah yang padat menjadi catatan belajar terstruktur dengan konsep kunci, terminologi, contoh nyata, rumus, dan latihan refleksi.',
      badge: 'Terstruktur'
    },
    {
      icon: Bot,
      title: 'Forge AI Tutor',
      desc: 'Tutor Socratik pribadi berbahasa Indonesia yang memahami isi materi Anda. Siap menjawab pertanyaan sulit dengan analogi yang ramah dan mudah dimengerti.',
      badge: 'Interaktif'
    },
    {
      icon: Layers,
      title: 'Smart Flashcards (SRS)',
      desc: 'Sistem pengulangan berkala (Spaced Repetition) cerdas yang menghitung kapan saat terbaik untuk meninjau materi sebelum Anda lupa.',
      badge: 'Spaced Repetition'
    },
    {
      icon: GraduationCap,
      title: 'Kuis & Simulasi Ujian',
      desc: 'Evaluasi kesiapan ujian dengan kuis pilihan ganda, benar/salah, serta Try Out analitis lengkap dengan diagnosis topik yang masih lemah.',
      badge: 'Format Ujian'
    },
    {
      icon: Calendar,
      title: 'Jadwal & Target Belajar',
      desc: 'Atur sesi belajar harian dan mingguan secara terarah. Lengkap dengan pelacak streak dan level XP untuk memotivasi konsistensi belajar Anda.',
      badge: 'Produktif'
    },
    {
      icon: Brain,
      title: 'Analisis Kemajuan Nyata',
      desc: 'Pantau grafik waktu belajar, skor kuis, dan penguasaan subjek berdasarkan catatan aktivitas nyata yang tersimpan di perangkat Anda.',
      badge: 'Berbasis Data'
    }
  ];

  const faqs = [
    {
      q: 'Apakah StudyForge AI dirancang khusus untuk mahasiswa dan pelajar Indonesia?',
      a: 'Ya. StudyForge AI dirancang dengan sistem penjelasan berbahasa Indonesia yang alami, kontekstual, dan selaras dengan kurikulum pendidikan tinggi maupun sekolah di Indonesia.'
    },
    {
      q: 'Materi apa saja yang bisa dimasukkan ke dalam StudyForge AI?',
      a: 'Anda dapat memasukkan materi berupa topik kuliah, teks salinan catatan modul, dokumen PDF (modul / jurnal / slide presentasi), hingga tautan video pembelajaran.'
    },
    {
      q: 'Apakah saya membutuhkan API Key Google Gemini untuk mencoba aplikasi ini?',
      a: 'Tidak wajib. StudyForge AI memiliki Mode Demo Cerdas bawaan dengan kurikulum dan dataset simulasi lengkap, sehingga Anda dapat langsung mencoba seluruh fitur (catatan, flashcard, kuis, jadwal, analitik) tanpa konfigurasi awal. Jika Anda ingin menghubungkan akun Gemini AI Anda sendiri, cukup masukkan API Key di file .env.'
    },
    {
      q: 'Bagaimana data materi dan kemajuan belajar saya disimpan?',
      a: 'Data Anda disimpan secara aman dan persisten di penyimpanan lokal peramban (IndexedDB) menggunakan arsitektur repositori modular. Data Anda tidak akan hilang saat halaman disegarkan.'
    },
    {
      q: 'Bagaimana cara kerja Smart Flashcards di platform ini?',
      a: 'Flashcards menggunakan algoritma Spaced Repetition (SuperMemo SM-2) yang menjadwalkan tanggal tinjauan berikutnya berdasarkan tingkat kemudahan mengingat Anda (Ulangi, Sulit, Bagus, Mudah).'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Platform Pembelajaran AI Generasi Baru Mahasiswa Indonesia</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-[1.15]">
            Ubah Materi Kuliah Jadi{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600">
              Pemahaman Nyata.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Satu ruang belajar pintar untuk merangkum materi, memahami konsep sulit, menghafal lebih efektif dengan Spaced Repetition, dan mempersiapkan ujian dengan bantuan AI.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/dashboard">
              <Button size="xl" variant="primary" iconRight={ArrowRight}>
                Mulai Belajar Sekarang
              </Button>
            </Link>
            <a href="#fitur">
              <Button size="xl" variant="outline">
                Jelajahi Fitur
              </Button>
            </a>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tanpa Wajib Kartu Kredit
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Siap Digunakan Langsung
            </span>
          </div>

          {/* Realistic Dashboard Preview UI */}
          <div className="mt-14 relative max-w-5xl mx-auto rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-200/80 to-slate-300/40 shadow-elevated border border-slate-200/90">
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-card text-left">
              {/* Window Header */}
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-slate-500">studyforge-ai.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AI Tutor Siap</span>
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/50">
                <div className="md:col-span-2 space-y-4">
                  {/* Greeting banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-700 text-white shadow-card">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-200">Selamat Belajar</span>
                    <h3 className="text-xl font-bold mt-1">Siap menaklukkan Ujian Tengah Semester? 🚀</h3>
                    <p className="text-xs text-brand-100 mt-1 max-w-md">3 kartu flashcard jatuh tempo hari ini. Selesaikan sekarang untuk menjaga streak 3 hari Anda!</p>
                  </div>

                  {/* Active Lesson Card preview */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-brand-600 uppercase">Sedang Dipelajari</span>
                      <h4 className="font-semibold text-sm text-slate-900">Struktur Data: Binary Search Tree & AVL Tree</h4>
                      <p className="text-xs text-slate-500">4 Konsep Kunci • 5 Pertanyaan Kuis • Rangkuman Siap</p>
                    </div>
                    <Link to="/lesson/lesson_cs_tree">
                      <Button size="sm" variant="secondary">Buka Catatan</Button>
                    </Link>
                  </div>
                </div>

                {/* Right widgets preview */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-subtle">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                      <span>Streak Belajar</span>
                      <span className="text-amber-600 font-bold">🔥 3 Hari</span>
                    </div>
                    <div className="flex justify-between gap-1 mt-2">
                      {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d, i) => (
                        <div key={d} className="flex flex-col items-center gap-1">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            i < 3 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                            ✓
                          </div>
                          <span className="text-[10px] text-slate-500">{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 shadow-subtle text-xs text-brand-900 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                      <span>Rekomendasi Hari Ini</span>
                    </div>
                    <p className="text-[11px] text-brand-700">Tinjau 5 kartu Biologi Molekuler untuk menjaga ingatan jangka panjang.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 px-3 py-1 rounded-full bg-brand-50 border border-brand-200">
              Fitur Lengkap
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Semua yang Anda Butuhkan untuk Menguasai Materi Kuliah
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Dari pembacaan awal materi hingga evaluasi simulasi ujian, dipandu oleh sistem AI yang terstruktur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 shadow-subtle">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {f.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bagaimana Cara Kerjanya?
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Hanya butuh 3 langkah sederhana untuk mengubah bahan kuliah mentah menjadi penguasaan materi nyata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle text-left">
              <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white font-bold flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">Masukkan Bahan Belajar</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Ketikkan topik mata kuliah, tempelkan teks modul, atau unggah file dokumen PDF bahan perkuliahan Anda.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle text-left">
              <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white font-bold flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">Sintesis AI Otomatis</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                StudyForge AI membedah materi menjadi poin ringkas, terminologi kunci, kartu pengingat (flashcard), dan kuis evaluasi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-subtle text-left">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">Kuasai dengan Tutor & Kuis</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Diskusikan bagian sulit dengan AI Tutor pribadi, latihan hafalan kartu, dan uji kesiapan ujian melalui simulasi soal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
            <p className="text-slate-600 mt-2 text-sm sm:text-base">
              Segala hal yang perlu Anda ketahui tentang StudyForge AI.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-brand-700 via-brand-600 to-violet-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Mulai Belajar Lebih Cerdas Hari Ini
          </h2>
          <p className="mt-3 text-base text-brand-100 max-w-xl mx-auto">
            Bergabunglah dengan ribuan mahasiswa Indonesia yang telah meningkatkan pemahaman materi dan indeks prestasi mereka.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/dashboard">
              <Button size="xl" variant="dark" iconRight={ArrowRight}>
                Buka StudyForge AI Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
            <span className="font-bold text-white text-sm">StudyForge AI</span>
            <span className="text-[11px] text-slate-500">• Learn Smarter. Understand Deeper.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/library" className="hover:text-white transition-colors">Perpustakaan</Link>
            <Link to="/tutor" className="hover:text-white transition-colors">AI Tutor</Link>
            <Link to="/flashcards" className="hover:text-white transition-colors">Flashcards</Link>
            <Link to="/planner" className="hover:text-white transition-colors">Planner</Link>
          </div>

          <div className="text-slate-500">
            © {new Date().getFullYear()} StudyForge AI. Hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  );
}
