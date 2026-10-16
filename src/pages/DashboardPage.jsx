import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Award,
  BookOpen,
  Layers,
  HelpCircle,
  PlusCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Brain,
  Bot,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/db';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function DashboardPage() {
  const { profile, levelInfo, setOnboardingOpen } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [dueCardsCount, setDueCardsCount] = useState(0);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Lessons
        const allLessons = await db.lessons.toArray();
        setLessons(allLessons);

        // 2. Flashcards due today
        const dueCount = await db.flashcards
          .filter(c => !c.nextReviewDate || c.nextReviewDate <= todayStr)
          .count();
        setDueCardsCount(dueCount);

        // 3. Upcoming planner sessions
        const sessions = await db.plannerSessions
          .filter(s => s.date >= todayStr && !s.isCompleted)
          .limit(3)
          .toArray();
        setUpcomingSessions(sessions);

        // 4. Recent quiz attempts
        const attempts = await db.quizAttempts.reverse().limit(3).toArray();
        setRecentAttempts(attempts);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    }

    loadDashboardData();
  }, []);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting =
    hour < 11
      ? 'Selamat Pagi'
      : hour < 15
      ? 'Selamat Siang'
      : hour < 18
      ? 'Selamat Sore'
      : 'Selamat Malam';

  // Format today date in Indonesian
  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate statistics from real DB records
  const completedLessonsCount = lessons.filter(l => l.isCompleted).length;
  const totalLessonsCount = lessons.length;
  const recentLessons = [...lessons]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 4);

  // Weekly study data for chart
  const weeklyData = [
    { day: 'Sen', menit: 35 },
    { day: 'Sel', menit: 45 },
    { day: 'Rab', menit: 60 },
    { day: 'Kam', menit: 30 },
    { day: 'Jum', menit: 50 },
    { day: 'Sab', menit: 20 },
    { day: 'Min', menit: 15 },
  ];

  // Subject distribution
  const subjectCounts = {};
  lessons.forEach(l => {
    const s = l.subject || 'Umum';
    subjectCounts[s] = (subjectCounts[s] || 0) + 1;
  });

  const subjectChartData = Object.keys(subjectCounts).map(subject => ({
    name: subject,
    value: subjectCounts[subject]
  }));

  const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Personal Greeting */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-700 text-white p-6 sm:p-8 shadow-card">
        {/* Abstract decorative circles */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-2 right-1/4 w-32 h-32 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-200">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayFormatted}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, {profile?.displayName || 'Mahasiswa'}! 👋
            </h1>
            <p className="text-sm text-brand-100 max-w-xl leading-relaxed">
              {dueCardsCount > 0
                ? `Anda memiliki ${dueCardsCount} kartu flashcard yang jatuh tempo ditinjau hari ini. Pertahankan streak belajar Anda!`
                : 'Semua kartu flashcard telah dipelajari. Siap membuat materi baru atau menguji pemahaman dengan kuis?'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/lesson/new">
              <Button variant="dark" size="md" icon={PlusCircle}>
                Buat Materi Baru
              </Button>
            </Link>
            <Link to="/flashcards">
              <Button variant="secondary" size="md" icon={Layers}>
                Tinjau Flashcards ({dueCardsCount})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Streak Belajar</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{profile?.streak || 1} Hari</div>
            <span className="text-[11px] text-emerald-600 font-medium">Aktif hari ini</span>
          </div>
        </Card>

        {/* Level & XP */}
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center shrink-0 border border-indigo-200">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-slate-500">Level & Pengalaman</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5 truncate">Lv. {levelInfo.level}</div>
            <span className="text-[11px] text-brand-600 font-medium">{levelInfo.currentXp} XP ({levelInfo.title})</span>
          </div>
        </Card>

        {/* Flashcards Due */}
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Flashcard Jatuh Tempo</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{dueCardsCount} Kartu</div>
            <span className="text-[11px] text-slate-500 font-medium">Spaced Repetition</span>
          </div>
        </Card>

        {/* Completed Lessons */}
        <Card className="flex items-center gap-4 p-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">Materi Selesai</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{completedLessonsCount} / {totalLessonsCount}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Tersimpan di Perpustakaan</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Continue Learning + Quick Actions & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Continue Learning & Recent Lessons */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning Card */}
          <Card>
            <CardHeader>
              <CardTitle>
                <BookOpen className="w-5 h-5 text-brand-600" />
                <span>Lanjutkan Belajar</span>
              </CardTitle>
              <Link to="/library" className="text-xs text-brand-600 hover:underline font-semibold flex items-center gap-1">
                <span>Lihat Semua ({totalLessonsCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>

            {recentLessons.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm">Belum ada materi pembelajaran yang dibuat.</p>
                <Link to="/lesson/new">
                  <Button size="sm" variant="primary">Buat Materi Pertama</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-subtle hover:border-brand-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">{lesson.subject || 'Umum'}</Badge>
                        {lesson.isCompleted && (
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 hover:text-brand-600 transition-colors">
                        <Link to={`/lesson/${lesson.id}`}>{lesson.title}</Link>
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {lesson.overview || 'Materi pembelajaran terstruktur.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/tutor?lessonId=${lesson.id}`}>
                        <Button variant="outline" size="sm" icon={Bot}>
                          Tanya Tutor
                        </Button>
                      </Link>
                      <Link to={`/lesson/${lesson.id}`}>
                        <Button variant="secondary" size="sm">
                          Buka Catatan
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Study Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TrendingUp className="w-5 h-5 text-brand-600" />
                <span>Aktivitas Waktu Belajar Mingguan</span>
              </CardTitle>
              <span className="text-xs text-slate-500 font-medium">Total: 255 Menit</span>
            </CardHeader>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit="m" />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    formatter={(value) => [`${value} Menit`, 'Durasi Belajar']}
                  />
                  <Bar dataKey="menit" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Quick Actions, Upcoming Sessions, Guided Checklist */}
        <div className="space-y-6">
          {/* Quick Action Buttons */}
          <Card className="space-y-2.5">
            <h3 className="font-semibold text-sm text-slate-900 mb-3">Aksi Cepat</h3>
            <Link to="/lesson/new" className="block">
              <Button variant="outline" size="md" className="w-full justify-start text-xs font-semibold" icon={PlusCircle}>
                Buat Materi Baru
              </Button>
            </Link>
            <Link to="/tutor" className="block">
              <Button variant="outline" size="md" className="w-full justify-start text-xs font-semibold" icon={Bot}>
                Konsultasi AI Tutor
              </Button>
            </Link>
            <Link to="/exam-practice" className="block">
              <Button variant="outline" size="md" className="w-full justify-start text-xs font-semibold" icon={Award}>
                Simulasi Latihan Ujian
              </Button>
            </Link>
            <Link to="/planner" className="block">
              <Button variant="outline" size="md" className="w-full justify-start text-xs font-semibold" icon={Calendar}>
                Buka Jadwal Belajar
              </Button>
            </Link>
          </Card>

          {/* Upcoming Planner Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Jadwal Terdekat</span>
              </CardTitle>
              <Link to="/planner" className="text-xs text-brand-600 hover:underline font-semibold">
                Atur
              </Link>
            </CardHeader>

            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">Tidak ada sesi belajar terjadwal hari ini.</p>
            ) : (
              <div className="space-y-2.5">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{session.title}</span>
                      <span className="text-[11px] text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md font-mono">
                        {session.startTime || '16:00'}
                      </span>
                    </div>
                    <div className="text-slate-500 flex items-center gap-2 text-[11px]">
                      <span>{session.subject}</span>
                      <span>•</span>
                      <span>{session.durationMinutes} Menit</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Guided Checklist for New Students */}
          <Card className="bg-gradient-to-br from-indigo-50/50 to-violet-50/50 border-brand-200">
            <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>Panduan Belajar Cerdas</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Unggah modul atau ketik topik materi kuliah di menu Buat Materi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Diskusikan konsep rumit bersama AI Tutor pribadi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Hafalkan kartu flashcard dengan metode Spaced Repetition.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Uji penguasaan lewat kuis dan try out simulasi ujian.</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
