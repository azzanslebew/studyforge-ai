import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Layers,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  Brain,
  Sparkles,
  Calendar,
  Trash2,
  Edit2,
  Check,
  Award
} from 'lucide-react';
import { db } from '../services/db';
import { calculateNextReview } from '../services/srsService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, DifficultyBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Textarea, Select } from '../components/ui/Input';

export function FlashcardsPage() {
  const [searchParams] = useSearchParams();
  const filterLessonId = searchParams.get('lessonId');

  const { awardXp } = useAuth();
  const { showToast } = useToast();

  const [flashcards, setFlashcards] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonFilter, setSelectedLessonFilter] = useState(filterLessonId || 'ALL');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [reviewedInSession, setReviewedInSession] = useState(0);

  // Manual Creation / Edit Modal
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardExplanation, setCardExplanation] = useState('');
  const [cardDifficulty, setCardDifficulty] = useState('medium');
  const [cardLessonId, setCardLessonId] = useState('');

  const loadData = async () => {
    try {
      const allCards = await db.flashcards.toArray();
      const allLessons = await db.lessons.toArray();
      setFlashcards(allCards);
      setLessons(allLessons);
      if (allLessons.length > 0 && !cardLessonId) {
        setCardLessonId(allLessons[0].id);
      }
    } catch (err) {
      console.error('Error loading flashcards:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter cards
  const displayedCards = flashcards.filter(c => {
    if (selectedLessonFilter === 'ALL') return true;
    return c.lessonId === selectedLessonFilter;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const dueCards = displayedCards.filter(c => !c.nextReviewDate || c.nextReviewDate <= todayStr);

  const currentCard = displayedCards[currentIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (cardModalOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNextCard();
      } else if (e.code === 'ArrowLeft') {
        handlePrevCard();
      } else if (isFlipped) {
        if (e.key === '1') handleRating('again');
        if (e.key === '2') handleRating('hard');
        if (e.key === '3') handleRating('good');
        if (e.key === '4') handleRating('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, cardModalOpen, displayedCards]);

  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentIndex < displayedCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...displayedCards].sort(() => Math.random() - 0.5);
    setFlashcards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    showToast('Urutan kartu berhasil diacak.', 'info');
  };

  // SM-2 Spaced Repetition Rating Handler
  const handleRating = async (rating) => {
    if (!currentCard) return;

    const srsUpdate = calculateNextReview(currentCard, rating);
    await db.flashcards.update(currentCard.id, srsUpdate);

    // Update in local state
    setFlashcards(prev => prev.map(c => c.id === currentCard.id ? { ...c, ...srsUpdate } : c));
    setReviewedInSession(prev => prev + 1);
    await awardXp(5, 'Meninjau Flashcard Cerdas');

    handleNextCard();
  };

  // Open Edit / Create Modal
  const openCreateModal = () => {
    setEditingCard(null);
    setCardFront('');
    setCardBack('');
    setCardExplanation('');
    setCardDifficulty('medium');
    setCardLessonId(lessons[0]?.id || '');
    setCardModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingCard(card);
    setCardFront(card.front);
    setCardBack(card.back);
    setCardExplanation(card.explanation || '');
    setCardDifficulty(card.difficulty || 'medium');
    setCardLessonId(card.lessonId);
    setCardModalOpen(true);
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) {
      showToast('Sisi depan dan belakang kartu wajib diisi.', 'warning');
      return;
    }

    const linkedLesson = lessons.find(l => l.id === cardLessonId);

    if (editingCard) {
      const updated = {
        ...editingCard,
        front: cardFront.trim(),
        back: cardBack.trim(),
        explanation: cardExplanation.trim(),
        difficulty: cardDifficulty,
        lessonId: cardLessonId,
        subject: linkedLesson?.subject || 'Umum',
      };
      await db.flashcards.put(updated);
      setFlashcards(prev => prev.map(c => c.id === editingCard.id ? updated : c));
      showToast('Kartu berhasil diperbarui.', 'success');
    } else {
      const newCard = {
        id: `fc_${Date.now()}`,
        lessonId: cardLessonId,
        subject: linkedLesson?.subject || 'Umum',
        front: cardFront.trim(),
        back: cardBack.trim(),
        explanation: cardExplanation.trim(),
        difficulty: cardDifficulty,
        nextReviewDate: todayStr,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        status: 'due',
        createdAt: new Date().toISOString()
      };
      await db.flashcards.put(newCard);
      setFlashcards(prev => [newCard, ...prev]);
      showToast('Kartu flashcard baru berhasil ditambahkan.', 'success');
    }

    setCardModalOpen(false);
  };

  const handleDeleteCard = async (cardId) => {
    await db.flashcards.delete(cardId);
    setFlashcards(prev => prev.filter(c => c.id !== cardId));
    showToast('Kartu dihapus.', 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Smart Flashcards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Optimalkan ingatan jangka panjang dengan sistem Spaced Repetition (SuperMemo SM-2).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Shuffle} onClick={handleShuffle}>
            Acak Kartu
          </Button>
          <Button variant="primary" size="sm" icon={PlusCircle} onClick={openCreateModal}>
            Tambah Kartu
          </Button>
        </div>
      </div>

      {/* Filter and Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <span>Filter Materi:</span>
          </div>
          <select
            value={selectedLessonFilter}
            onChange={(e) => {
              setSelectedLessonFilter(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionCompleted(false);
            }}
            className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-brand-500 truncate"
          >
            <option value="ALL">Semua Materi ({flashcards.length} kartu)</option>
            {lessons.map(l => (
              <option key={l.id} value={l.id}>
                {l.title} ({flashcards.filter(c => c.lessonId === l.id).length})
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl shadow-subtle flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-rose-800">
            <Calendar className="w-4 h-4 text-rose-600" />
            <span className="font-semibold">Jatuh Tempo Hari Ini:</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900 font-mono">
            {dueCards.length} Kartu
          </span>
        </div>
      </div>

      {/* Interactive Card Session Player */}
      {displayedCards.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800">Belum Ada Kartu Flashcard</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Buat materi baru di menu pembuatan catatan atau tambahkan kartu hafalan secara manual.
          </p>
          <Button variant="primary" size="sm" icon={PlusCircle} onClick={openCreateModal}>
            Buat Kartu Pertama
          </Button>
        </Card>
      ) : sessionCompleted ? (
        /* Completion Celebration Screen */
        <Card className="p-8 text-center space-y-5 bg-gradient-to-b from-indigo-50/50 to-white border-brand-200 shadow-card animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-elevated">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Sesi Belajar Selesai! 🎉</h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Hebat! Anda telah meninjau {reviewedInSession} kartu dalam sesi ini. Tanggal review berikutnya telah dijadwalkan otomatis oleh algoritma SRS.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setSessionCompleted(false);
                setReviewedInSession(0);
              }}
            >
              Ulangi Sesi Ini
            </Button>
            <Link to="/dashboard">
              <Button variant="primary" size="md">
                Kembali ke Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Main Active Flashcard Player */
        <div className="space-y-4">
          {/* Progress Bar & Counter */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>Kartu {currentIndex + 1} dari {displayedCards.length}</span>
            <span>{Math.round(((currentIndex + 1) / displayedCards.length) * 100)}% Selesai</span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / displayedCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(prev => !prev)}
            className="cursor-pointer select-none min-h-[300px] sm:min-h-[340px] rounded-3xl p-8 bg-white border border-slate-200 shadow-card hover:shadow-elevated transition-all flex flex-col justify-between relative group"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">{currentCard.subject || 'Umum'}</Badge>
              <div className="flex items-center gap-2">
                <DifficultyBadge difficulty={currentCard.difficulty} />
                <span className="text-[11px] font-mono text-slate-400">
                  {isFlipped ? 'Sisi Belakang (Jawaban)' : 'Sisi Depan (Pertanyaan)'}
                </span>
              </div>
            </div>

            {/* Card Content Text */}
            <div className="my-auto py-6 text-center space-y-4">
              {!isFlipped ? (
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed max-w-xl mx-auto">
                  {currentCard.front}
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="text-base sm:text-lg md:text-xl font-bold text-brand-700 leading-relaxed max-w-xl mx-auto">
                    {currentCard.back}
                  </div>
                  {currentCard.explanation && (
                    <div className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60 leading-relaxed">
                      💡 <strong>Penjelasan:</strong> {currentCard.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Card Controls & Flip Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
              <span className="hidden sm:inline">Tekan <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border text-slate-600 font-mono">Spasi</kbd> untuk membalik kartu</span>
              <span className="sm:hidden">Ketuk untuk membalik kartu</span>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openEditModal(currentCard)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                  title="Edit kartu"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteCard(currentCard.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Hapus kartu"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* SM-2 Recall Rating Buttons (Shown when card is flipped) */}
          {isFlipped ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-card space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <span className="block text-center text-xs font-semibold text-slate-600">
                Bagaimana tingkat kemudahan Anda mengingat jawaban ini?
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleRating('again')}
                  className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                >
                  <span>1. Ulangi (Lupa)</span>
                  <span className="text-[10px] font-normal text-rose-600">Review: 1 Hari</span>
                </button>

                <button
                  onClick={() => handleRating('hard')}
                  className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                >
                  <span>2. Sulit</span>
                  <span className="text-[10px] font-normal text-amber-600">Review: 2-3 Hari</span>
                </button>

                <button
                  onClick={() => handleRating('good')}
                  className="p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-brand-800 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                >
                  <span>3. Bagus</span>
                  <span className="text-[10px] font-normal text-brand-600">Review: 4-6 Hari</span>
                </button>

                <button
                  onClick={() => handleRating('easy')}
                  className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-95"
                >
                  <span>4. Sangat Mudah</span>
                  <span className="text-[10px] font-normal text-emerald-600">Review: 7+ Hari</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="md"
                icon={ChevronLeft}
                onClick={handlePrevCard}
                disabled={currentIndex === 0}
              >
                Sebelumnya
              </Button>
              <Button
                variant="primary"
                size="md"
                iconRight={ChevronRight}
                onClick={handleNextCard}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Manual Add / Edit Modal */}
      <Modal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        title={editingCard ? 'Edit Kartu Flashcard' : 'Tambah Kartu Flashcard Baru'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveCard} className="space-y-4">
          <Select
            label="Materi Terkait"
            value={cardLessonId}
            onChange={(e) => setCardLessonId(e.target.value)}
          >
            {lessons.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </Select>

          <Textarea
            label="Sisi Depan (Pertanyaan / Konsep)"
            value={cardFront}
            onChange={(e) => setCardFront(e.target.value)}
            placeholder="misal: Berapakah nilai Balance Factor pada AVL Tree yang valid?"
            rows={3}
            required
          />

          <Textarea
            label="Sisi Belakang (Jawaban Inti)"
            value={cardBack}
            onChange={(e) => setCardBack(e.target.value)}
            placeholder="misal: -1, 0, atau +1."
            rows={3}
            required
          />

          <Textarea
            label="Penjelasan Tambahan / Konteks (Opsional)"
            value={cardExplanation}
            onChange={(e) => setCardExplanation(e.target.value)}
            placeholder="misal: Nilai 2 atau -2 berarti simpul tidak seimbang dan perlu rotasi."
            rows={2}
          />

          <Select
            label="Tingkat Kesulitan"
            value={cardDifficulty}
            onChange={(e) => setCardDifficulty(e.target.value)}
          >
            <option value="easy">Mudah</option>
            <option value="medium">Sedang</option>
            <option value="hard">Sulit</option>
          </Select>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setCardModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Kartu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
