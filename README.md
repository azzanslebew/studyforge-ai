# StudyForge AI — Complete AI-Powered Learning Platform

> **Tagline:** *"Learn Smarter. Understand Deeper."*  
> **Bahasa Utama:** Bahasa Indonesia (dirancang khusus untuk pelajar dan mahasiswa Indonesia).

---

## 📖 Tentang StudyForge AI

**StudyForge AI** adalah platform pembelajaran berbasis kecerdasan buatan (*AI-powered learning platform*) yang dirancang untuk membantu mahasiswa dan pelajar Indonesia belajar lebih terarah, efektif, dan mendalam.

Platform ini mentransformasikan materi kuliah yang padat (catatan, modul kuliah, dokumen PDF, materi topik) menjadi:
1. **Rangkuman Catatan Terstruktur (AI Study Notes)**: Dilengkapi konsep kunci, terminologi, contoh kasus industri di Indonesia, formula, mitos vs fakta (*common misconceptions*), dan latihan refleksi.
2. **Forge AI Tutor**: Asisten tutor personal berbahasa Indonesia yang memahami isi materi kuliah Anda, mampu memberikan analogi dunia nyata, menjawab pertanyaan lanjutan, dan membimbing dengan metode Socratik.
3. **Smart Flashcards (Spaced Repetition)**: Kartu pengingat cerdas yang menggunakan varian algoritma **SuperMemo SM-2** untuk mengoptimalkan memori jangka panjang sebelum ujian.
4. **Kuis Interaktif & Simulasi Ujian (Try Out)**: Uji kesiapan ujian dengan kuis pilihan ganda, benar/salah, navigasi soal, timer, dan evaluasi diagnosis topik yang masih lemah (*weak-topic diagnosis*).
5. **Jadwal Belajar (Study Planner)**: Kalender belajar harian dan mingguan dengan target waktu dan prioritas.
6. **Analisis Belajar Nyata (Learning Analytics)**: Grafik waktu belajar mingguan, riwayat nilai kuis, dan penguasaan subjek menggunakan visualisasi **Recharts**.
7. **Gamifikasi Ringan**: XP, Level bertingkat (dari *Mahasiswa Baru* hingga *Master Akademisi*), streak belajar harian, dan lencana prestasi (*Achievements*).

---

## 🛠️ Teknologi yang Digunakan

- **Frontend Framework:** React JS (JavaScript murni, modular, tanpa TypeScript).
- **Tooling & Build:** Vite 5.
- **Styling:** Tailwind CSS dengan palet khusus (*brand indigo, soft neutral backgrounds, subtle borders, card shadows*).
- **Navigasi & Routing:** React Router DOM v6.
- **Ikonografi:** Lucide React.
- **Visualisasi & Grafik:** Recharts.
- **Rendering Edukasi:** React Markdown & Remark GFM.
- **Ekstraksi PDF:** Multer & `pdf-parse` pada server, didukung fallback peramban `pdfjs-dist` dengan deteksi dokumen scan/OCR.
- **Ekspor Dokumen:** jsPDF (ekspor PDF berformat rapi) dan pengunduh Markdown (`.md`).
- **Penyimpanan Data Lokal:** IndexedDB menggunakan **Dexie.js** (data tersimpan persisten di peramban tanpa wajib server database).
- **Backend Server:** Node.js & Express dengan middleware CORS, Express Rate Limit, dan dotenv.
- **Validasi Data:** Zod Schema Validation.
- **Integrasi AI:** Google Gemini API (`@google/generative-ai` dengan model fleksibel seperti `gemini-1.5-flash` melalui server backend aman).

---

## ⚡ Mode Demo vs Live Gemini AI

StudyForge AI dirancang agar **dapat langsung dicoba 100% tanpa konfigurasi wajib**:

| Fitur | Mode Demo Bawaan (Tanpa API Key) | Mode Live Gemini AI (Dengan API Key) |
| :--- | :--- | :--- |
| **Status Indikator** | Badge Amber: `Mode Demo Cerdas` | Badge Emerald: `AI Live (gemini-1.5-flash)` |
| **Kebutuhan Setup** | Langsung jalan setelah `npm run dev` | Masukkan `GEMINI_API_KEY` di file `.env` |
| **Pembuatan Catatan** | Generator kurikulum simulasi cerdas | Generasi kontekstual langsung dari LLM Gemini |
| **AI Tutor Chat** | Agen respon edukasi lokal berbobot akademis | Percakapan multi-turn live dengan Gemini API |
| **Smart Flashcards** | Dataset flashcard kurikulum teruji | Ekstraksi otomatis konsep kunci dari materi |
| **Kuis & Try Out** | Bank soal akademik berbobot | Pembuatan soal analisis (HOTS) otomatis |
| **Penyimpanan Data** | Tersimpan persisten di IndexedDB lokal | Tersimpan persisten di IndexedDB lokal |

> **Catatan Keamanan:** API Key Google Gemini tidak pernah terekspos ke frontend browser pengguna. Seluruh panggilan LLM diproses secara privat melalui server backend Express.

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat
- Node.js versi 18 atau lebih baru (direkomendasikan Node.js v20+).
- npm versi 9 atau lebih baru.

### 2. Kloning & Instalasi Dependensi
```bash
# Pindah ke direktori proyek
cd studyforge-ai

# Instal dependensi
npm install
```

### 3. Konfigurasi Lingkungan (Opsional untuk Live AI)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan tambahkan API Key Google Gemini Anda jika ingin mengaktifkan Live AI:
```env
PORT=3001
GEMINI_API_KEY=masukkan_api_key_google_gemini_disini
GEMINI_MODEL=gemini-1.5-flash
```
*(Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/)).*

### 4. Menjalankan Aplikasi dalam Mode Pengembangan
Jalankan frontend dan backend secara bersamaan:
```bash
npm run dev
```
- **Frontend Vite:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:3001`

*(Atau jalankan secara terpisah: `npm run dev:server` untuk backend dan `npm run dev:client` untuk frontend).*

### 5. Menjalankan Pengujian Unit
```bash
npm test
```
Menjalankan pengujian otomatis untuk algoritma Spaced Repetition (SM-2), leveling gamifikasi, validasi skema Zod, dan generator kurikulum.

### 6. Membangun untuk Produksi (Production Build)
```bash
npm run build
```
Hasil build yang optimal dan minified akan tersimpan di direktori `dist/`.

---

## 📱 Arsitektur & Struktur Direktori

```text
studyforge-ai/
├── server/                      # Backend Express & Gemini AI Service
│   ├── index.js                 # Server Express & API Endpoints
│   ├── geminiService.js         # Provider abstraksi Google Gemini API
│   ├── prompts.js               # Prompt engineering kurikulum akademis
│   ├── validation.js            # Zod validation schemas
│   └── mockEducationalData.js   # Dataset kurikulum simulasi cerdas
├── src/
│   ├── components/
│   │   ├── layout/              # Navbar, Sidebar, AppLayout
│   │   └── ui/                  # Button, Card, Badge, Modal, Input, AiStatusBadge
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Profil pelajar, status AI, XP, streak
│   │   └── ToastContext.jsx     # Sistem notifikasi toast
│   ├── pages/
│   │   ├── LandingPage.jsx      # Halaman utama produk
│   │   ├── DashboardPage.jsx    # Dashboard personal & statistik
│   │   ├── LibraryPage.jsx      # Manajemen materi & folder
│   │   ├── NewLessonPage.jsx    # Input Topik, Teks, PDF, YouTube
│   │   ├── LessonDetailPage.jsx # Catatan materi, editor, ekspor PDF/MD
│   │   ├── TutorPage.jsx        # Percakapan interaktif AI Tutor
│   │   ├── FlashcardsPage.jsx   # Spaced Repetition SM-2 flashcard
│   │   ├── QuizPage.jsx         # Kuis interaktif, timer & pembahasan
│   │   ├── ExamPracticePage.jsx # Try Out, timer & diagnosis kelemahan
│   │   ├── PlannerPage.jsx      # Kalender jadwal belajar mingguan/harian
│   │   ├── AnalyticsPage.jsx    # Visualisasi Recharts & Achievements
│   │   └── SettingsPage.jsx     # Pengaturan profil, uji AI, backup data
│   ├── services/
│   │   ├── db.js                # Dexie IndexedDB & Seed Data Mahasiswa
│   │   ├── aiService.js         # Client API service
│   │   ├── pdfService.js        # Parsing & ekstraksi PDF
│   │   ├── srsService.js        # SuperMemo SM-2 algorithm
│   │   ├── gamificationService.js # Penghitungan Level, XP, Confetti
│   │   └── exportService.js     # Ekspor ke PDF & Markdown
│   ├── styles/
│   │   └── index.css            # Tailwind & print styles
│   ├── App.jsx                  # React Router Configuration
│   └── main.jsx                 # React DOM Root Entry
├── scripts/
│   └── test-units.js            # Automated Unit Test Suite
├── .env.example
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🌟 Hak Cipta & Lisensi

Dibuat untuk memajukan kualitas belajar mahasiswa dan pelajar Indonesia.  
© 2026 **StudyForge AI** — *Learn Smarter. Understand Deeper.*
