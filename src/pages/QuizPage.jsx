import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Award,
  AlertTriangle,
  BookOpen,
  Send
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { awardXp } = useAuth();
  const { showToast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [allQuizzes, setAllQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quiz Player State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { qId: answerString }
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(300); // 5 minutes default
  const [timerActive, setTimerActive] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  useEffect(() => {
    async function loadQuizData() {
      try {
        const quizzes = await db.quizzes.toArray();
        setAllQuizzes(quizzes);

        let target = null;
        if (id) {
          target = quizzes.find(q => q.id === id || q.id === `quiz_${id}` || q.lessonId === id);
        }
        if (!target && quizzes.length > 0) {
          target = quizzes[0];
        }
        setQuiz(target);
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || isSubmitted || !quiz) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz(true); // Auto submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, isSubmitted, quiz]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Menyiapkan kuis interaktif...</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="p-12 text-center max-w-md mx-auto space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Belum Ada Kuis untuk Materi Ini</h2>
        <p className="text-xs text-slate-500">
          Kuis dihasilkan otomatis saat membuat materi baru. Buka perpustakaan untuk memilih materi yang memiliki kuis.
        </p>
        <Link to="/library">
          <Button variant="primary" size="sm">Buka Perpustakaan</Button>
        </Link>
      </Card>
    );
  }

  const questions = quiz.questions;
  const currentQuestion = questions[currentQIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  // Format timer
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const timerFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const handleSelectOption = (qId, optionText) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: optionText
    }));
  };

  const handleSubmitQuiz = async (auto = false) => {
    setConfirmSubmitModal(false);
    setTimerActive(false);

    // Calculate score
    let correct = 0;
    questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct += 1;
      }
    });

    const scorePercentage = Math.round((correct / totalQuestions) * 100);
    const timeSpent = 300 - timeRemainingSeconds;

    const resultObj = {
      score: scorePercentage,
      totalQuestions,
      correctCount: correct,
      timeSpentSeconds: timeSpent,
      passed: scorePercentage >= 70,
    };

    setQuizResult(resultObj);
    setIsSubmitted(true);

    // Save attempt to IndexedDB for analytics
    await db.quizAttempts.put({
      id: `attempt_${Date.now()}`,
      quizId: quiz.id,
      lessonId: quiz.lessonId,
      score: scorePercentage,
      totalQuestions,
      correctCount: correct,
      timeSpentSeconds: timeSpent,
      answers: selectedAnswers,
      date: new Date().toISOString()
    });

    // Award XP
    const earnedXp = 25 + Math.round(scorePercentage * 0.2);
    await awardXp(earnedXp, `Menyelesaikan Kuis: ${quiz.title}`);

    if (auto) {
      showToast('Waktu habis! Kuis otomatis dinilai.', 'warning');
    } else {
      showToast(`Kuis selesai! Skor: ${scorePercentage}% (+${earnedXp} XP)`, 'success');
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setTimeRemainingSeconds(300);
    setTimerActive(true);
    setIsSubmitted(false);
    setQuizResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">Kuis Interaktif</Badge>
            {quiz.lessonId && (
              <Link to={`/lesson/${quiz.lessonId}`} className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Lihat Catatan Materi</span>
              </Link>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-900">{quiz.title}</h1>
        </div>

        {/* Timer Badge */}
        {!isSubmitted && (
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
            timeRemainingSeconds < 60
              ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <Clock className="w-4 h-4 text-brand-600" />
            <span>{timerFormatted}</span>
          </div>
        )}
      </div>

      {/* RESULT SCREEN */}
      {isSubmitted && quizResult && (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          <Card className="p-8 text-center space-y-5 bg-gradient-to-b from-indigo-50/40 to-white border-brand-200 shadow-card">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-elevated ${
              quizResult.passed ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Hasil Evaluasi Pemahaman</span>
              <h2 className="text-3xl font-extrabold text-slate-900">{quizResult.score}%</h2>
              <p className="text-sm font-semibold text-slate-700">
                {quizResult.passed ? '🎉 Selamat! Anda telah menguasai materi ini dengan sangat baik.' : 'Tetap semangat! Tinjau pembahasan jawaban di bawah untuk memperdalam konsep.'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400">Benar</div>
                <div className="text-base font-bold text-emerald-600 mt-0.5">{quizResult.correctCount} Soal</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400">Total</div>
                <div className="text-base font-bold text-slate-800 mt-0.5">{quizResult.totalQuestions} Soal</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-slate-400">Waktu</div>
                <div className="text-base font-bold text-brand-600 mt-0.5">{quizResult.timeSpentSeconds} dtk</div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" size="md" icon={RotateCcw} onClick={handleRetake}>
                Ulangi Kuis
              </Button>
              <Link to="/analytics">
                <Button variant="primary" size="md">
                  Lihat Analisis Belajar
                </Button>
              </Link>
            </div>
          </Card>

          {/* Detailed Question Review */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-slate-900">Pembahasan Jawaban Detail</h3>
            {questions.map((q, idx) => {
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              return (
                <Card key={q.id} className={`p-5 space-y-3 border ${
                  isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Soal {idx + 1}</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{isCorrect ? 'Benar' : 'Salah'}</span>
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-slate-900">{q.question}</h4>

                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium w-28">Jawaban Anda:</span>
                      <span className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {userAnswer || '(Tidak dijawab)'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium w-28">Kunci Jawaban:</span>
                        <span className="font-semibold text-emerald-700">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                    💡 <strong>Pembahasan:</strong> {q.explanation}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ACTIVE QUIZ PLAYER */}
      {!isSubmitted && (
        <div className="space-y-4">
          {/* Question Navigator Pills */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
              {questions.map((q, idx) => {
                const isAnswered = Boolean(selectedAnswers[q.id]);
                const isCurrent = idx === currentQIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs shrink-0 transition-all ${
                      isCurrent
                        ? 'bg-brand-600 text-white ring-2 ring-brand-300'
                        : isAnswered
                        ? 'bg-brand-100 text-brand-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs font-semibold text-slate-500 shrink-0">
              Terjawab: {answeredCount} / {totalQuestions}
            </div>
          </div>

          {/* Active Question Card */}
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Pertanyaan {currentQIndex + 1} dari {totalQuestions}</span>
              <span className="uppercase">{currentQuestion.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Benar / Salah'}</span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedAnswers[currentQuestion.id] === opt;
                return (
                  <div
                    key={i}
                    onClick={() => handleSelectOption(currentQuestion.id, opt)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-brand-950 font-semibold' : 'text-slate-800'}`}>
                        {opt}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controls */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <Button
                variant="outline"
                size="md"
                icon={ChevronLeft}
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
              >
                Sebelumnya
              </Button>

              {currentQIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  iconRight={ChevronRight}
                  onClick={() => setCurrentQIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                >
                  Selanjutnya
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="md"
                  icon={Send}
                  onClick={() => setConfirmSubmitModal(true)}
                >
                  Selesaikan Kuis
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      <Modal
        isOpen={confirmSubmitModal}
        onClose={() => setConfirmSubmitModal(false)}
        title="Kumpulkan Jawaban Kuis?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Anda telah menjawab <strong className="text-slate-900">{answeredCount}</strong> dari <strong className="text-slate-900">{totalQuestions}</strong> pertanyaan.
          </p>
          {answeredCount < totalQuestions && (
            <p className="text-xs text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
              Perhatian: Masih ada {totalQuestions - answeredCount} pertanyaan yang belum Anda jawab. Pertanyaan yang kosong akan dinilai salah.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmSubmitModal(false)}>
              Lanjut Mengerjakan
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleSubmitQuiz(false)}>
              Kumpulkan Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
