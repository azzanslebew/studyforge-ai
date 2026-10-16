import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  Bot,
  Layers,
  HelpCircle,
  FileDown,
  Printer,
  Edit3,
  Save,
  CheckCircle2,
  Star,
  Trash2,
  ArrowLeft,
  Copy,
  Folder,
  Sparkles,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { db } from '../services/db';
import { exportLessonToPdf, exportLessonToMarkdown } from '../services/exportService';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

export function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { awardXp } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedOverview, setEditedOverview] = useState('');
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        const found = await db.lessons.get(id);
        if (found) {
          setLesson(found);
          setEditedTitle(found.title);
          setEditedOverview(found.overview);
        }
      } catch (err) {
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Memuat catatan materi...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Materi Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">
          Materi yang Anda cari mungkin telah dihapus atau URL tidak valid.
        </p>
        <Link to="/library">
          <Button variant="primary" size="sm">Kembali ke Perpustakaan</Button>
        </Link>
      </div>
    );
  }

  // Toggle favorite
  const handleToggleFavorite = async () => {
    const newFav = !lesson.isFavorite;
    await db.lessons.update(lesson.id, { isFavorite: newFav });
    setLesson(prev => ({ ...prev, isFavorite: newFav }));
    showToast(newFav ? 'Ditambahkan ke Favorit' : 'Dihapus dari Favorit', 'info');
  };

  // Toggle completed
  const handleToggleCompleted = async () => {
    const newComp = !lesson.isCompleted;
    await db.lessons.update(lesson.id, { isCompleted: newComp });
    setLesson(prev => ({ ...prev, isCompleted: newComp }));
    if (newComp) {
      await awardXp(20, 'Menyelesaikan Membaca Materi');
      showToast('Materi ditandai Selesai! (+20 XP)', 'success');
    } else {
      showToast('Materi ditandai Belum Selesai', 'info');
    }
  };

  // Save edits
  const handleSaveEdits = async () => {
    await db.lessons.update(lesson.id, {
      title: editedTitle,
      overview: editedOverview,
      updatedAt: new Date().toISOString()
    });
    setLesson(prev => ({
      ...prev,
      title: editedTitle,
      overview: editedOverview,
      updatedAt: new Date().toISOString()
    }));
    setIsEditing(false);
    showToast('Perubahan catatan berhasil disimpan.', 'success');
  };

  // Copy Markdown
  const handleCopy = () => {
    const textToCopy = `# ${lesson.title}\n\n${lesson.overview}\n\n${(lesson.detailedSections || []).map(s => `## ${s.heading}\n${s.content}`).join('\n\n')}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('Catatan berhasil disalin ke clipboard!', 'success');
  };

  // Delete
  const handleDelete = async () => {
    await db.lessons.delete(lesson.id);
    // Also delete linked flashcards & quiz
    await db.flashcards.where('lessonId').equals(lesson.id).delete();
    await db.quizzes.where('lessonId').equals(lesson.id).delete();
    showToast('Materi berhasil dihapus.', 'info');
    navigate('/library');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Perpustakaan</span>
        </Link>

        <div className="flex items-center gap-2">
          {lesson.sourceMaterial && (
            <Button
              variant="outline"
              size="sm"
              icon={BookOpen}
              onClick={() => setShowSourceModal(true)}
            >
              Lihat Materi Sumber
            </Button>
          )}

          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-xl border border-slate-200 transition-colors ${
              lesson.isFavorite ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Favorit"
          >
            <Star className={`w-4 h-4 ${lesson.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>

          <Button
            variant={lesson.isCompleted ? 'success' : 'outline'}
            size="sm"
            icon={CheckCircle2}
            onClick={handleToggleCompleted}
          >
            {lesson.isCompleted ? 'Selesai' : 'Tandai Selesai'}
          </Button>

          <button
            onClick={() => setDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors"
            title="Hapus materi"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md">{lesson.subject || 'Umum'}</Badge>
            <span className="text-xs text-slate-400 font-mono">
              Dibuat: {new Date(lesson.createdAt).toLocaleDateString('id-ID')}
            </span>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={Copy} onClick={handleCopy}>
              Salin
            </Button>
            <Button variant="outline" size="sm" icon={FileDown} onClick={() => exportLessonToMarkdown(lesson)}>
              Markdown
            </Button>
            <Button variant="outline" size="sm" icon={FileDown} onClick={() => exportLessonToPdf(lesson)}>
              PDF
            </Button>
            <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
              Cetak
            </Button>
            <Button
              variant={isEditing ? 'secondary' : 'outline'}
              size="sm"
              icon={isEditing ? Save : Edit3}
              onClick={isEditing ? handleSaveEdits : () => setIsEditing(true)}
            >
              {isEditing ? 'Simpan' : 'Edit Catatan'}
            </Button>
          </div>
        </div>

        {/* Title */}
        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full text-2xl font-extrabold text-slate-900 border-b-2 border-brand-500 pb-1 focus:outline-none"
          />
        ) : (
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            {lesson.title}
          </h1>
        )}

        {/* Interactive Action Hub Bar: Tutor, Flashcards, Quiz */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
          <Link
            to={`/tutor?lessonId=${lesson.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:border-brand-400 hover:shadow-card transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">AI Tutor Personal</div>
              <div className="text-[11px] text-slate-500">Tanya konsep materi ini</div>
            </div>
          </Link>

          <Link
            to={`/flashcards?lessonId=${lesson.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:border-brand-400 hover:shadow-card transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Smart Flashcards</div>
              <div className="text-[11px] text-slate-500">Latihan Spaced Repetition</div>
            </div>
          </Link>

          <Link
            to={`/quiz/quiz_${lesson.id}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 shadow-subtle hover:border-brand-400 hover:shadow-card transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Kuis Pemahaman</div>
              <div className="text-[11px] text-slate-500">Uji kesiapan ujian materi</div>
            </div>
          </Link>
        </div>

        {/* 1. Overview */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Gambaran Umum (Overview)
          </h2>
          {isEditing ? (
            <textarea
              rows={4}
              value={editedOverview}
              onChange={(e) => setEditedOverview(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          ) : (
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed bg-brand-50/40 p-5 rounded-2xl border border-brand-100/60">
              {lesson.overview}
            </p>
          )}
        </div>

        {/* 2. Learning Objectives */}
        {lesson.learningObjectives && lesson.learningObjectives.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>2. Tujuan Pembelajaran (Learning Objectives)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lesson.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Key Concepts */}
        {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>3. Konsep-Konsep Kunci</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {lesson.keyConcepts.map((kc, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle space-y-1.5">
                  <h4 className="font-bold text-xs text-brand-700">{kc.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{kc.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Detailed Sections */}
        {lesson.detailedSections && lesson.detailedSections.length > 0 && (
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              4. Penjelasan Mendalam per Bab
            </h2>
            {lesson.detailedSections.map((sec, i) => (
              <div key={i} className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                  {sec.heading}
                </h3>
                <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {sec.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Terminology & Formulas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Terminology */}
          {lesson.terminology && lesson.terminology.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                5. Glosarium & Terminologi Penting
              </h2>
              <div className="space-y-2">
                {lesson.terminology.map((t, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-900">{t.term}</span>
                    <p className="text-slate-600">{t.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulas */}
          {lesson.formulas && lesson.formulas.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                6. Rumus & Aturan Logika
              </h2>
              <div className="space-y-2">
                {lesson.formulas.map((f, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1.5">
                    <div className="font-bold text-brand-900">{f.name}</div>
                    <code className="block bg-white p-2 rounded-lg font-mono text-xs text-brand-700 border border-indigo-100">
                      {f.formula}
                    </code>
                    <p className="text-slate-600 text-[11px]">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. Practical Examples */}
        {lesson.practicalExamples && lesson.practicalExamples.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>7. Contoh Kasus & Aplikasi Nyata</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lesson.practicalExamples.map((ex, i) => (
                <div key={i} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-900">{ex.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{ex.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. Common Misconceptions */}
        {lesson.commonMisconceptions && lesson.commonMisconceptions.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>8. Kekeliruan Umum (Misconceptions)</span>
            </h2>
            <div className="space-y-2.5">
              {lesson.commonMisconceptions.map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/70 text-xs space-y-1">
                  <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                    <span>❌ Mitos / Salah Paham:</span>
                    <span>{m.misconception}</span>
                  </div>
                  <div className="text-emerald-800 flex items-center gap-1.5 pt-1">
                    <span>✅ Fakta & Koreksi:</span>
                    <span>{m.correction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. Key Takeaways & Review Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          {/* Key Takeaways */}
          {lesson.keyTakeaways && lesson.keyTakeaways.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                9. Poin Rangkuman Penting (Key Takeaways)
              </h2>
              <ul className="space-y-2 text-xs text-slate-700">
                {lesson.keyTakeaways.map((k, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Review Questions */}
          {lesson.reviewQuestions && lesson.reviewQuestions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                10. Pertanyaan Refleksi & Pemahaman
              </h2>
              <div className="space-y-2 text-xs text-slate-700">
                {lesson.reviewQuestions.map((q, i) => (
                  <div key={i} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                    <span className="font-semibold text-brand-900">Soal Refleksi {i + 1}:</span>
                    <p className="text-slate-700">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Source Material Modal */}
      <Modal
        isOpen={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        title={`Bahan Sumber Asli: ${lesson.sourceTitle || lesson.title}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-500">
            Berikut adalah bahan teks mentah atau dokumen yang dianalisis oleh AI untuk menghasilkan catatan materi ini:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-96 overflow-y-auto font-mono text-slate-700 whitespace-pre-wrap">
            {lesson.sourceMaterial || 'Tidak ada teks sumber yang disimpan.'}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        title="Hapus Catatan Materi"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus materi ini beserta seluruh flashcards dan kuis terkait?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirm(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Hapus Permanen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
