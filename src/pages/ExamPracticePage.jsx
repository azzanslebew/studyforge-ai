import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileCheck2,
  TrendingDown,
  Info
} from 'lucide-react';
import { db } from '../services/db';
import { generateExamApi } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select, Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export function ExamPracticePage() {
  const { profile, awardXp } = useAuth();
  const { showToast } = useToast();

  const [lessons, setLessons] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);
  const [difficulty, setDifficulty] = useState('hard');
  const [questionCount, setQuestionCount] = useState(5);
  const [timeMinutes, setTimeMinutes] = useState(15);

  // Exam Generation & Running State
  const [isGenerating, setIsGenerating] = useState(false);
  const [examData, setExamData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState(false);
  const [examResult, setExamResult] = useState(null);

  useEffect(() => {
    async function loadLessons() {
      const all = await db.lessons.toArray();
      setLessons(all);
      if (all.length > 0) {
        setSelectedSubject(all[0].subject || 'Umum');
        setSelectedLessonIds([all[0].id]);
      }
    }
    loadLessons();
  }, []);

  // Update selected lessons when subject changes
  const handleSubjectChange = (subj) => {
    setSelectedSubject(subj);
    const related = lessons.filter(l => l.subject === subj);
    setSelectedLessonIds(related.map(l => l.id));
  };

  const toggleLessonSelection = (id) => {
    setSelectedLessonIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Exam countdown timer
  useEffect(() => {
    if (!examData || isExamFinished || timeRemainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examData, isExamFinished, timeRemainingSeconds]);

  const handleStartExam = async (e) => {
    e.preventDefault();
    if (selectedLessonIds.length === 0) {
      showToast('Harap pilih minimal 1 materi untuk diujikan.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const chosenLessons = lessons.filter(l => selectedLessonIds.includes(l.id));
      const lessonTitles = chosenLessons.map(l => l.title);
      const summaryContent = chosenLessons.map(l => `${l.title}:\n${l.overview}`).join('\n\n');

      const response = await generateExamApi({
        subject: selectedSubject,
        lessonTitles,
        contentSummary: summaryContent,
        count: Number(questionCount),
        difficulty,
        timeMinutes: Number(timeMinutes)
      });

      if (response.exam && response.exam.questions) {
        setExamData(response.exam);
        setTimeRemainingSeconds(Number(timeMinutes) * 60);
        setSelectedAnswers({});
        setCurrentIdx(0);
        setIsExamFinished(false);
        setExamResult(null);
        showToast('Simulasi ujian siap! Kerjakan dengan teliti.', 'success');
      } else {
        throw new Error('Format ujian tidak valid.');
      }
    } catch (err) {
      console.error('Failed to generate exam:', err);
      showToast('Gagal membuat simulasi ujian.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishExam = async (auto = false) => {
    setConfirmSubmitModal(false);
    setIsExamFinished(true);

    if (!examData) return;

    let correctCount = 0;
    const weakTopicsMap = {};

    examData.questions.forEach(q => {
      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
      if (isCorrect) {
        correctCount += 1;
      } else {
        const topic = q.topic || selectedSubject;
        weakTopicsMap[topic] = (weakTopicsMap[topic] || 0) + 1;
      }
    });

    const total = examData.questions.length;
    const scorePercentage = Math.round((correctCount / total) * 100);
    const passed = scorePercentage >= (examData.passingScore || 70);

    const weakTopics = Object.keys(weakTopicsMap).map(t => ({
      topic: t,
      wrongCount: weakTopicsMap[t]
    }));

    const result = {
      score: scorePercentage,
      total,
      correctCount,
      passed,
      weakTopics
    };

    setExamResult(result);
    const earnedXp = 40 + Math.round(scorePercentage * 0.3);
    await awardXp(earnedXp, `Menyelesaikan Simulasi Ujian: ${selectedSubject}`);

    if (auto) {
      showToast('Waktu ujian habis! Ujian otomatis dinilai.', 'warning');
    } else {
      showToast(`Ujian Selesai! Skor: ${scorePercentage}% (+${earnedXp} XP)`, 'success');
    }
  };

  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const timerFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const availableSubjects = Array.from(new Set(lessons.map(l => l.subject || 'Umum')));

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Simulasi Latihan Ujian & Try Out
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Uji kesiapan menghadapi UTS, UAS, atau ujian semester dengan soal berbasis analisis dan evaluasi topik lemah.
        </p>
      </div>

      {/* SETUP VIEW: If no active exam */}
      {!examData && (
        <form onSubmit={handleStartExam} className="space-y-6">
          <Card className="space-y-5">
            <h2 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              <span>Konfigurasi Ujian</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Mata Kuliah / Subjek Ujian"
                value={selectedSubject}
                onChange={(e) => handleSubjectChange(e.target.value)}
              >
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>

              <Select
                label="Tingkat Kesulitan"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="medium">Sedang (Standar Akademik)</option>
                <option value="hard">Sulit (Tingkat Analitis & HOTS)</option>
              </Select>

              <Select
                label="Jumlah Soal"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
              >
                <option value={5}>5 Soal (Latihan Cepat)</option>
                <option value={10}>10 Soal (Standar UTS)</option>
                <option value={15}>15 Soal (Simulasi Lengkap)</option>
              </Select>

              <Select
                label="Batas Waktu Pengerjaan"
                value={timeMinutes}
                onChange={(e) => setTimeMinutes(Number(e.target.value))}
              >
                <option value={10}>10 Menit</option>
                <option value={15}>15 Menit</option>
                <option value={30}>30 Menit</option>
                <option value={45}>45 Menit</option>
              </Select>
            </div>

            {/* Choose relevant lessons */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Pilih Cakupan Materi yang Diujikan
              </label>
              <div className="space-y-2">
                {lessons
                  .filter(l => !selectedSubject || l.subject === selectedSubject)
                  .map(lesson => (
                    <label
                      key={lesson.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedLessonIds.includes(lesson.id)
                          ? 'bg-brand-50 border-brand-400 text-brand-950 font-medium'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLessonIds.includes(lesson.id)}
                        onChange={() => toggleLessonSelection(lesson.id)}
                        className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                      />
                      <span className="text-xs sm:text-sm">{lesson.title}</span>
                    </label>
                  ))}
              </div>
            </div>

            {/* Disclaimers */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
              <p>
                <strong>Catatan Akademik:</strong> Soal-soal ini dirancang sebagai sarana latihan dan simulasi pemahaman mandiri, bukan merupakan jaminan bocoran soal ujian resmi universitas.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isGenerating}
                iconRight={ArrowRight}
              >
                Mulai Ujian Sekarang
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* ACTIVE EXAM RUNNER */}
      {examData && !isExamFinished && (
        <div className="space-y-4 animate-in fade-in">
          {/* Header Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
                Simulasi Ujian Sedang Berlangsung
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">{examData.title}</h2>
            </div>

            {/* Countdown Badge */}
            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              timeRemainingSeconds < 120
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}>
              <Clock className="w-4 h-4 text-brand-600" />
              <span>{timerFormatted}</span>
            </div>
          </div>

          {/* Navigator Bar */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-subtle flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {examData.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs shrink-0 transition-all ${
                    idx === currentIdx
                      ? 'bg-brand-600 text-white ring-2 ring-brand-300'
                      : selectedAnswers[q.id]
                      ? 'bg-brand-100 text-brand-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <Button
              variant="success"
              size="sm"
              onClick={() => setConfirmSubmitModal(true)}
            >
              Kumpulkan Ujian
            </Button>
          </div>

          {/* Active Question */}
          {examData.questions[currentIdx] && (
            <Card className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Soal {currentIdx + 1} dari {examData.questions.length}</span>
                <span className="text-brand-600 font-sans font-semibold">
                  Topik: {examData.questions[currentIdx].topic || selectedSubject}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {examData.questions[currentIdx].question}
              </h3>

              <div className="space-y-3 pt-2">
                {examData.questions[currentIdx].options.map((opt, i) => {
                  const qId = examData.questions[currentIdx].id;
                  const isSelected = selectedAnswers[qId] === opt;
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedAnswers(prev => ({ ...prev, [qId]: opt }))}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? 'text-brand-950 font-semibold' : 'text-slate-800'}`}>
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="md"
                  icon={ChevronLeft}
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                >
                  Sebelumnya
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  iconRight={ChevronRight}
                  onClick={() => setCurrentIdx(prev => Math.min(examData.questions.length - 1, prev + 1))}
                  disabled={currentIdx === examData.questions.length - 1}
                >
                  Selanjutnya
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* EXAM RESULT & DIAGNOSIS SCREEN */}
      {isExamFinished && examResult && (
        <div className="space-y-6 animate-in zoom-in-95">
          <Card className="p-8 text-center space-y-5 bg-gradient-to-b from-indigo-50/50 to-white border-brand-200 shadow-card">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-white shadow-elevated ${
              examResult.passed ? 'bg-emerald-600' : 'bg-amber-600'
            }`}>
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Skor Simulasi Ujian</span>
              <h2 className="text-4xl font-extrabold text-slate-900">{examResult.score}%</h2>
              <p className="text-sm font-semibold text-slate-700">
                {examResult.passed ? '🎉 Lulus! Pemahaman komprehensif Anda sudah sangat solid.' : 'Belum Lulus. Perlu penguatan pada beberapa topik tertentu.'}
              </p>
            </div>

            {/* Weak-Topic Diagnosis Section */}
            {examResult.weakTopics.length > 0 && (
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-left text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  <span>Diagnosis Topik yang Perlu Ditinjau Kembali:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {examResult.weakTopics.map(wt => (
                    <li key={wt.topic}>
                      <strong>{wt.topic}</strong> ({wt.wrongCount} kesalahan)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setExamData(null);
                  setIsExamFinished(false);
                  setExamResult(null);
                }}
              >
                Buat Try Out Baru
              </Button>
              <Link to="/library">
                <Button variant="primary" size="md">
                  Buka Modul Pembelajaran
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Submit Modal */}
      <Modal
        isOpen={confirmSubmitModal}
        onClose={() => setConfirmSubmitModal(false)}
        title="Kumpulkan Jawaban Try Out?"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Anda telah menjawab <strong className="text-slate-900">{Object.keys(selectedAnswers).length}</strong> dari <strong className="text-slate-900">{examData?.questions.length || 0}</strong> soal ujian.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmSubmitModal(false)}>
              Lanjut
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleFinishExam(false)}>
              Kumpulkan Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
