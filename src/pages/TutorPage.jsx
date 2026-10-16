import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Send,
  Sparkles,
  BookOpen,
  RotateCcw,
  Lightbulb,
  HelpCircle,
  Copy,
  Check,
  Loader2,
  Trash2
} from 'lucide-react';
import { db } from '../services/db';
import { tutorChatApi } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function TutorPage() {
  const [searchParams] = useSearchParams();
  const lessonIdFromUrl = searchParams.get('lessonId');

  const { profile, awardXp } = useAuth();
  const { showToast } = useToast();

  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(lessonIdFromUrl || '');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const messagesEndRef = useRef(null);

  // Quick prompt suggestions
  const quickPrompts = [
    'Jelaskan dengan bahasa sederhana.',
    'Berikan contoh nyata di Indonesia.',
    'Apa perbedaan konsep ini dengan pendekatan lain?',
    'Buatkan latihan soal pemahaman beserta pembahasannya.',
    'Poin apa saja yang wajib saya hafalkan untuk ujian?'
  ];

  // Load lessons for selector
  useEffect(() => {
    async function init() {
      const all = await db.lessons.toArray();
      setLessons(all);
      if (lessonIdFromUrl && all.some(l => l.id === lessonIdFromUrl)) {
        setSelectedLessonId(lessonIdFromUrl);
      } else if (all.length > 0 && !selectedLessonId) {
        setSelectedLessonId(all[0].id);
      }
    }
    init();
  }, [lessonIdFromUrl]);

  // Initial welcome message based on selected lesson
  useEffect(() => {
    const activeLesson = lessons.find(l => l.id === selectedLessonId);
    const welcome = activeLesson
      ? `Halo ${profile?.displayName || 'Mahasiswa'}! 👋\n\nSaya **Forge Tutor**, asisten belajar AI pribadi Anda. Saat ini kita sedang fokus mendiskusikan materi **"${activeLesson.title}"**.\n\nAnda dapat meminta saya menyederhanakan penjelasan bab tertentu, memberikan studi kasus nyata, atau menguji pemahaman dengan latihan soal interaktif.\n\nApa konsep yang ingin kita bahas terlebih dahulu?`
      : `Halo ${profile?.displayName || 'Mahasiswa'}! 👋\n\nSaya **Forge Tutor**, asisten belajar AI pribadi Anda. Pilih salah satu materi di menu atas untuk mulai berdiskusi, atau tanyakan apa saja seputar perkuliahan dan persiapan ujian Anda!`;

    setMessages([
      {
        role: 'assistant',
        content: welcome,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [selectedLessonId, lessons]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingReply]);

  const activeLesson = lessons.find(l => l.id === selectedLessonId);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text || loadingReply) return;

    setInputText('');

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoadingReply(true);

    try {
      const response = await tutorChatApi({
        message: text,
        history: newMessages.map(m => ({ role: m.role, content: m.content })),
        contextLesson: activeLesson ? {
          title: activeLesson.title,
          overview: activeLesson.overview,
          content: activeLesson.detailedSections?.map(s => `${s.heading}:\n${s.content}`).join('\n\n') || '',
          keyConcepts: activeLesson.keyConcepts,
        } : null,
        explanationStyle: profile?.explanationStyle || 'Lengkap & Akademis'
      });

      const assistantMsg = {
        role: 'assistant',
        content: response.reply || 'Maaf, terjadi kendala saat merespon.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
      await awardXp(5, 'Konsultasi Belajar dengan AI Tutor');
    } catch (err) {
      console.error('Tutor chat failed:', err);
      showToast('Gagal mendapatkan respon tutor.', 'error');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleCopyMessage = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(index);
    showToast('Teks disalin ke clipboard', 'success');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearChat = () => {
    const welcome = activeLesson
      ? `Halo! Sesi percakapan baru untuk **"${activeLesson.title}"** dimulai. Apa yang ingin kita bahas?`
      : 'Sesi percakapan baru dimulai. Ada topik apa yang ingin Anda pelajari?';
    setMessages([{ role: 'assistant', content: welcome, timestamp: new Date().toISOString() }]);
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-3 max-w-4xl mx-auto">
      {/* Top Header Card: Active Lesson Context Selector */}
      <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
              <span>Forge AI Tutor</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {activeLesson ? `Konteks: ${activeLesson.title}` : 'Konteks Umum (Tanpa materi spesifik)'}
            </p>
          </div>
        </div>

        {/* Lesson dropdown selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:border-brand-500 max-w-[220px] truncate"
          >
            <option value="">(Tutor Umum - Bebas Topik)</option>
            {lessons.map(l => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
            title="Reset percakapan"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-1 scrollbar-thin">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in duration-200`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-subtle ${
                  isUser
                    ? 'bg-slate-900 text-white'
                    : 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`relative group max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-subtle ${
                  isUser
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                {!isUser ? (
                  <div className="prose prose-slate max-w-none text-xs sm:text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}

                {/* Copy button on assistant messages */}
                {!isUser && (
                  <button
                    onClick={() => handleCopyMessage(msg.content, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                    title="Salin jawaban"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loadingReply && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-subtle">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 shadow-subtle flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Forge Tutor sedang memformulasikan penjelasan terbaik...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Saran:</span>
        </div>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(qp)}
            className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-brand-400 text-slate-600 hover:text-brand-700 whitespace-nowrap shadow-subtle transition-all active:scale-95"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-card shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              activeLesson
                ? `Tanyakan sesuatu seputar "${activeLesson.title}"...`
                : 'Tanyakan konsep atau soal akademik apa saja...'
            }
            className="flex-1 px-3 py-2 text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
            disabled={loadingReply}
          />
          <Button
            type="submit"
            size="md"
            variant="primary"
            disabled={!inputText.trim() || loadingReply}
            icon={Send}
          >
            Kirim
          </Button>
        </form>
      </div>
    </div>
  );
}
