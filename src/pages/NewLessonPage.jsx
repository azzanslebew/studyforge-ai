import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  UploadCloud,
  FileCode,
  Video,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Info,
  Loader2,
  File
} from 'lucide-react';
import { generateLessonApi, generateFlashcardsApi, generateQuizApi } from '../services/aiService';
import { parsePdfFile } from '../services/pdfService';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function NewLessonPage() {
  const navigate = useNavigate();
  const { profile, awardXp } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('topic'); // 'topic' | 'text' | 'pdf' | 'youtube'

  // Form Fields
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(profile?.subjects?.[0] || 'Umum');
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'Universitas (S1)');
  const [explanationStyle, setExplanationStyle] = useState(profile?.explanationStyle || 'Lengkap & Akademis');

  // Text tab fields
  const [rawText, setRawText] = useState('');

  // PDF tab fields
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfExtractedText, setPdfExtractedText] = useState('');
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [pdfPreviewModal, setPdfPreviewModal] = useState(false);

  // YouTube tab fields
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeNote, setYoutubeNote] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Handle PDF file selection & extraction
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setPdfError('');
    setPdfExtracting(true);

    try {
      const result = await parsePdfFile(file);
      setPdfExtractedText(result.text);
      if (!topic) {
        // Set topic from filename without extension
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTopic(cleanName);
      }
      showToast(`Berhasil mengekstrak ${result.characterCount} karakter dari ${result.pageCount} halaman PDF.`, 'success');
    } catch (err) {
      console.error('PDF extraction failed:', err);
      setPdfError(err.message || 'Gagal mengekstrak teks dari file PDF.');
      showToast(err.message || 'Gagal mengekstrak PDF.', 'error');
    } finally {
      setPdfExtracting(false);
    }
  };

  // Main Submit Generation
  const handleGenerate = async (e) => {
    e.preventDefault();

    let textPayload = '';
    let effectiveTitle = topic.trim();
    let sourceType = activeTab;

    if (activeTab === 'topic') {
      if (!effectiveTitle) {
        showToast('Harap masukkan topik materi yang ingin dipelajari.', 'warning');
        return;
      }
    } else if (activeTab === 'text') {
      if (!rawText.trim() || rawText.trim().length < 20) {
        showToast('Harap tempelkan teks materi minimal 20 karakter.', 'warning');
        return;
      }
      textPayload = rawText;
      if (!effectiveTitle) effectiveTitle = rawText.slice(0, 50).trim() + '...';
    } else if (activeTab === 'pdf') {
      if (!pdfExtractedText) {
        showToast('Teks belum berhasil diekstrak dari PDF. Pastikan file valid.', 'warning');
        return;
      }
      textPayload = pdfExtractedText;
      if (!effectiveTitle) effectiveTitle = pdfFile?.name.replace(/\.[^/.]+$/, '') || 'Materi PDF';
    } else if (activeTab === 'youtube') {
      if (!youtubeUrl.trim() || !youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
        showToast('Harap masukkan URL YouTube yang valid.', 'warning');
        return;
      }
      textPayload = youtubeNote ? `Konteks Video (${youtubeUrl}):\n${youtubeNote}` : `Analisis video pembelajaran dari URL: ${youtubeUrl}`;
      if (!effectiveTitle) effectiveTitle = `Pembahasan Video YouTube`;
    }

    setIsGenerating(true);

    try {
      setGenerationStep('Menganalisis materi & konsep fundamental...');
      const response = await generateLessonApi({
        topic: effectiveTitle,
        text: textPayload,
        sourceTitle: pdfFile ? pdfFile.name : activeTab === 'youtube' ? youtubeUrl : effectiveTitle,
        educationLevel,
        explanationStyle
      });

      if (!response.success && !response.data) {
        throw new Error(response.error || 'Gagal menghasilkan materi.');
      }

      setGenerationStep('Menyusun silabus, terminologi, dan rangkuman...');
      const lessonData = response.data;
      const lessonId = `lesson_${Date.now()}`;

      // Save lesson into IndexedDB
      const newLesson = {
        id: lessonId,
        title: lessonData.title || effectiveTitle,
        subject,
        folderId: null,
        sourceType,
        sourceTitle: pdfFile ? pdfFile.name : effectiveTitle,
        sourceMaterial: textPayload.slice(0, 5000),
        isFavorite: false,
        isArchived: false,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        overview: lessonData.overview || '',
        learningObjectives: lessonData.learningObjectives || [],
        keyConcepts: lessonData.keyConcepts || [],
        detailedSections: lessonData.detailedSections || [],
        terminology: lessonData.terminology || [],
        practicalExamples: lessonData.practicalExamples || [],
        formulas: lessonData.formulas || [],
        commonMisconceptions: lessonData.commonMisconceptions || [],
        keyTakeaways: lessonData.keyTakeaways || [],
        reviewQuestions: lessonData.reviewQuestions || [],
        suggestedNextSteps: lessonData.suggestedNextSteps || []
      };

      await db.lessons.put(newLesson);

      // Auto-generate flashcards & quiz in background
      setGenerationStep('Menghasilkan Smart Flashcards & Bank Soal Kuis...');
      try {
        const fcRes = await generateFlashcardsApi({
          lessonTitle: newLesson.title,
          content: `${newLesson.overview}\n${newLesson.keyTakeaways.join('\n')}`,
          count: 5,
          subject
        });

        if (fcRes.flashcards && fcRes.flashcards.length > 0) {
          const todayStr = new Date().toISOString().split('T')[0];
          const cardsToSave = fcRes.flashcards.map((c, idx) => ({
            id: `fc_${lessonId}_${idx}`,
            lessonId,
            subject,
            front: c.front,
            back: c.back,
            explanation: c.explanation || '',
            difficulty: c.difficulty || 'medium',
            nextReviewDate: todayStr,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            status: 'due',
            createdAt: new Date().toISOString()
          }));
          await db.flashcards.bulkPut(cardsToSave);
        }

        const quizRes = await generateQuizApi({
          lessonTitle: newLesson.title,
          content: newLesson.overview || effectiveTitle,
          count: 5
        });

        if (quizRes.quiz && quizRes.quiz.questions) {
          await db.quizzes.put({
            id: `quiz_${lessonId}`,
            lessonId,
            title: quizRes.quiz.title || `Kuis: ${newLesson.title}`,
            questions: quizRes.quiz.questions,
            createdAt: new Date().toISOString()
          });
        }
      } catch (autoErr) {
        console.warn('Auto sub-generation note:', autoErr);
      }

      await awardXp(25, 'Membuat Materi Pembelajaran Baru');
      showToast('Materi berhasil dibuat dan siap dipelajari! (+25 XP)', 'success');
      navigate(`/lesson/${lessonId}`);
    } catch (err) {
      console.error('Lesson creation failed:', err);
      showToast(`Gagal membuat materi: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Buat Materi Baru
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Ubah topik, teks catatan, modul PDF, atau video perkuliahan menjadi Rangkuman Materi Pembelajaran (AI Study Notes) yang komprehensif.
        </p>
      </div>

      {/* Generation Loading Overlay */}
      {isGenerating && (
        <Card className="p-8 text-center bg-gradient-to-b from-indigo-50/50 to-white border-brand-200 shadow-card space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-elevated">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-900">StudyForge AI Sedang Bekerja...</h3>
            <p className="text-xs sm:text-sm text-brand-700 font-medium">{generationStep}</p>
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Sistem sedang menyusun konsep inti, contoh kasus, terminologi penting, rumus, kartu pengingat, dan kuis pemahaman.
          </p>
        </Card>
      )}

      {!isGenerating && (
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Source Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('topic')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'topic'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Topik Materi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'text'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Teks Manual</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'pdf'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-brand-600" />
              <span>Dokumen PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('youtube')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'youtube'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Video className="w-4 h-4 text-rose-600" />
              <span>URL YouTube</span>
            </button>
          </div>

          {/* Tab 1: Topic Input */}
          {activeTab === 'topic' && (
            <Card className="space-y-4">
              <Input
                label="Topik atau Judul Bab yang Ingin Dipelajari"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="misal: Algoritma Dijkstra & Graph最短路, Hukum Termodinamika II, Akuntansi Biaya"
                required
              />
              <p className="text-xs text-slate-500">
                Ketikkan topik spesifik. AI akan secara otomatis merancang silabus lengkap berstandar akademik tinggi.
              </p>
            </Card>
          )}

          {/* Tab 2: Manual Text Input */}
          {activeTab === 'text' && (
            <Card className="space-y-4">
              <Input
                label="Judul Catatan (Opsional)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="misal: Rangkuman Kuliah Minggu 4"
              />
              <Textarea
                label="Tempelkan Teks Materi / Catatan Kuliah"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Tempelkan teks artikel ilmiah, slide perkuliahan, atau ringkasan modul di sini..."
                rows={8}
                required
              />
              <div className="flex justify-between text-xs text-slate-500 font-mono">
                <span>Minimal 20 karakter</span>
                <span>{rawText.length} karakter</span>
              </div>
            </Card>
          )}

          {/* Tab 3: PDF Document Upload */}
          {activeTab === 'pdf' && (
            <Card className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-3xl p-8 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="pdfUpload"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <label htmlFor="pdfUpload" className="cursor-pointer block space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center mx-auto border border-indigo-200 shadow-subtle">
                    {pdfExtracting ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-7 h-7" />}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-brand-600 hover:underline">
                      {pdfFile ? pdfFile.name : 'Klik untuk memilih file PDF'}
                    </span>
                    <span className="text-slate-500 text-sm"> atau seret dan lepas file ke sini</span>
                  </div>
                  <p className="text-xs text-slate-400">Maksimum ukuran file: 15MB. Mendukung dokumen PDF dengan lapisan teks.</p>
                </label>
              </div>

              {pdfError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <strong>Kendala Ekstraksi:</strong> {pdfError}
                  </div>
                </div>
              )}

              {pdfExtractedText && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      Teks berhasil diekstrak! ({pdfExtractedText.length} karakter siap dianalisis).
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPdfPreviewModal(true)}
                  >
                    Pratinjau Teks
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Tab 4: YouTube URL */}
          {activeTab === 'youtube' && (
            <Card className="space-y-4">
              <Input
                label="Tautan URL Video YouTube Edukasi"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required
              />
              <Textarea
                label="Catatan atau Poin Inti Tambahan dari Video (Opsional)"
                value={youtubeNote}
                onChange={(e) => setYoutubeNote(e.target.value)}
                placeholder="Tambahkan catatan khusus atau bagian menit penting yang ingin ditekankan..."
                rows={4}
              />
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <p>
                  StudyForge AI akan menganalisis topik dan transkrip resmi video. Jika video tidak memiliki transkrip tertutup, sistem akan merancang kurikulum komprehensif berdasarkan judul dan catatan Anda.
                </p>
              </div>
            </Card>
          )}

          {/* Educational Preferences / Customization Parameters */}
          <Card className="space-y-4">
            <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600" />
              <span>Pengaturan & Personalisasi Materi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Mata Kuliah / Subjek"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="misal: Algoritma, Biologi"
              />

              <Select
                label="Jenjang Pendidikan"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
              >
                <option value="SMA / SMK / MA">SMA / SMK / MA</option>
                <option value="Universitas (S1)">Universitas (S1)</option>
                <option value="Pascasarjana (S2 / S3)">Pascasarjana (S2 / S3)</option>
                <option value="Profesional">Profesional</option>
              </Select>

              <Select
                label="Gaya Penjelasan"
                value={explanationStyle}
                onChange={(e) => setExplanationStyle(e.target.value)}
              >
                <option value="Lengkap & Akademis">Lengkap & Akademis</option>
                <option value="Sederhana & Mudah Dipahami">Sederhana & Mudah Dipahami</option>
                <option value="Langkah demi Langkah">Langkah demi Langkah</option>
                <option value="Berdasarkan Contoh Nyata">Berdasarkan Contoh Nyata</option>
              </Select>
            </div>
          </Card>

          {/* Submit CTA */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              iconRight={ArrowRight}
              loading={isGenerating}
            >
              Hasilkan Materi dengan AI
            </Button>
          </div>
        </form>
      )}

      {/* PDF Text Preview Modal */}
      <Modal
        isOpen={pdfPreviewModal}
        onClose={() => setPdfPreviewModal(false)}
        title={`Pratinjau Hasil Ekstraksi PDF: ${pdfFile?.name || ''}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Berikut adalah teks yang berhasil dibaca dari dokumen PDF Anda. AI akan menganalisis teks ini untuk menyusun materi pembelajaran.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-96 overflow-y-auto font-mono text-xs text-slate-800 whitespace-pre-wrap">
            {pdfExtractedText || 'Tidak ada teks.'}
          </div>
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setPdfPreviewModal(false)}>
              Gunakan Teks Ini
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
