import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CalendarDays
} from 'lucide-react';
import { db } from '../services/db';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Select, Textarea } from '../components/ui/Input';

export function PlannerPage() {
  const { profile, awardXp } = useAuth();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('weekly'); // 'weekly' or 'daily'

  // Modal State
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(profile?.subjects?.[0] || 'Umum');
  const [lessonId, setLessonId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('16:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    try {
      const allSessions = await db.plannerSessions.toArray();
      const allLessons = await db.lessons.toArray();
      setSessions(allSessions);
      setLessons(allLessons);
    } catch (err) {
      console.error('Failed to load planner data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute 7 days of the current week around selectedDate
  const curr = new Date(selectedDate);
  const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(curr);
  monday.setDate(curr.getDate() - distanceToMonday);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d.toISOString().split('T')[0]);
  }

  const handleToggleComplete = async (session) => {
    const newStatus = !session.isCompleted;
    await db.plannerSessions.update(session.id, { isCompleted: newStatus });
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, isCompleted: newStatus } : s));

    if (newStatus) {
      await awardXp(20, 'Menyelesaikan Sesi Belajar Terjadwal');
      showToast('Sesi belajar selesai! (+20 XP)', 'success');
    }
  };

  const handleDeleteSession = async (id) => {
    await db.plannerSessions.delete(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    showToast('Sesi belajar dihapus.', 'info');
  };

  const openAddModal = (targetDate = selectedDate) => {
    setEditingSession(null);
    setTitle('');
    setSubject(profile?.subjects?.[0] || 'Umum');
    setLessonId(lessons[0]?.id || '');
    setDate(targetDate);
    setStartTime('16:00');
    setDurationMinutes(45);
    setPriority('medium');
    setNotes('');
    setSessionModalOpen(true);
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setTitle(session.title);
    setSubject(session.subject);
    setLessonId(session.lessonId || '');
    setDate(session.date);
    setStartTime(session.startTime || '16:00');
    setDurationMinutes(session.durationMinutes || 45);
    setPriority(session.priority || 'medium');
    setNotes(session.notes || '');
    setSessionModalOpen(true);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul sesi wajib diisi.', 'warning');
      return;
    }

    if (editingSession) {
      const updated = {
        ...editingSession,
        title: title.trim(),
        subject,
        lessonId: lessonId || null,
        date,
        startTime,
        durationMinutes: Number(durationMinutes),
        priority,
        notes: notes.trim(),
      };
      await db.plannerSessions.put(updated);
      setSessions(prev => prev.map(s => s.id === editingSession.id ? updated : s));
      showToast('Sesi belajar diperbarui.', 'success');
    } else {
      const newSession = {
        id: `sess_${Date.now()}`,
        title: title.trim(),
        subject,
        lessonId: lessonId || null,
        date,
        startTime,
        durationMinutes: Number(durationMinutes),
        priority,
        notes: notes.trim(),
        isCompleted: false,
        createdAt: new Date().toISOString()
      };
      await db.plannerSessions.put(newSession);
      setSessions(prev => [...prev, newSession]);
      showToast('Sesi belajar dijadwalkan.', 'success');
    }
    setSessionModalOpen(false);
  };

  const priorityBadge = (p) => {
    if (p === 'high') return <Badge variant="danger" size="sm">Prioritas Tinggi</Badge>;
    if (p === 'low') return <Badge variant="default" size="sm">Rendah</Badge>;
    return <Badge variant="warning" size="sm">Sedang</Badge>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jadwal Belajar (Planner)</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rencanakan target sesi belajar mingguan, tentukan prioritas, dan raih konsistensi belajar Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-100">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'weekly' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-600'
              }`}
            >
              Mingguan
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                viewMode === 'daily' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-600'
              }`}
            >
              Harian
            </button>
          </div>

          <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => openAddModal()}>
            Jadwal Baru
          </Button>
        </div>
      </div>

      {/* WEEKLY CALENDAR VIEW */}
      {viewMode === 'weekly' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {weekDays.map(dStr => {
              const d = new Date(dStr);
              const dayName = d.toLocaleDateString('id-ID', { weekday: 'short' });
              const dayNum = d.getDate();
              const isSelected = dStr === selectedDate;
              const isToday = dStr === new Date().toISOString().split('T')[0];
              const daySessions = sessions.filter(s => s.date === dStr);

              return (
                <div
                  key={dStr}
                  onClick={() => setSelectedDate(dStr)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-50/70 border-brand-500 shadow-sm ring-1 ring-brand-500'
                      : isToday
                      ? 'bg-indigo-50/30 border-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase text-slate-500">{dayName}</span>
                    {isToday && (
                      <span className="w-2 h-2 rounded-full bg-brand-600" title="Hari ini" />
                    )}
                  </div>
                  <div className="text-xl font-extrabold text-slate-900 mt-1">{dayNum}</div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    {daySessions.length} sesi
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sessions List on Selected Day */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Sesi Belajar: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <Button variant="outline" size="sm" icon={PlusCircle} onClick={() => openAddModal(selectedDate)}>
                Tambah ke Hari Ini
              </Button>
            </div>

            {sessions.filter(s => s.date === selectedDate).length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs space-y-2">
                <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Tidak ada sesi belajar untuk hari ini.</p>
                <Button variant="secondary" size="sm" onClick={() => openAddModal(selectedDate)}>
                  Jadwalkan Sekarang
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions
                  .filter(s => s.date === selectedDate)
                  .map(session => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        session.isCompleted
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200/90 shadow-subtle hover:border-brand-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleComplete(session)}
                          className={`mt-0.5 p-1 rounded-lg border transition-colors ${
                            session.isCompleted
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'border-slate-300 hover:border-brand-500 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary" size="sm">{session.subject}</Badge>
                            {priorityBadge(session.priority)}
                            <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {session.startTime} ({session.durationMinutes} menit)
                            </span>
                          </div>
                          <h4 className={`font-semibold text-sm ${session.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {session.title}
                          </h4>
                          {session.notes && (
                            <p className="text-xs text-slate-500">{session.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => openEditModal(session)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* DAILY VIEW */}
      {viewMode === 'daily' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm font-semibold px-3 py-1.5 rounded-xl border border-slate-200"
            />
            <Button size="sm" variant="primary" icon={PlusCircle} onClick={() => openAddModal(selectedDate)}>
              Tambah Sesi
            </Button>
          </div>

          <div className="space-y-3 pt-2">
            {sessions.filter(s => s.date === selectedDate).map(session => (
              <div key={session.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-subtle flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-slate-900">{session.title}</h4>
                  <p className="text-xs text-slate-500">{session.subject} • {session.startTime} • {session.durationMinutes} Menit</p>
                </div>
                <Button
                  size="sm"
                  variant={session.isCompleted ? 'success' : 'outline'}
                  onClick={() => handleToggleComplete(session)}
                >
                  {session.isCompleted ? 'Selesai' : 'Tandai Selesai'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add / Edit Session Modal */}
      <Modal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        title={editingSession ? 'Edit Sesi Belajar' : 'Jadwalkan Sesi Belajar Baru'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveSession} className="space-y-4">
          <Input
            label="Judul Sesi Belajar"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="misal: Menghafal Flashcard Replikasi DNA"
            required
            autoFocus
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Mata Kuliah / Subjek"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {(profile?.subjects || ['Umum']).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>

            <Select
              label="Hubungkan Materi (Opsional)"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
            >
              <option value="">(Tidak Terhubung)</option>
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </Select>

            <Input
              type="date"
              label="Tanggal Sesi"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Input
              type="time"
              label="Jam Mulai"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />

            <Select
              label="Durasi Belajar"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            >
              <option value={15}>15 Menit</option>
              <option value={30}>30 Menit</option>
              <option value={45}>45 Menit</option>
              <option value={60}>1 Jam</option>
              <option value={90}>1.5 Jam</option>
            </Select>

            <Select
              label="Prioritas"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
            </Select>
          </div>

          <Textarea
            label="Catatan / Target Khusus (Opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="misal: Fokus pada rotasi RL dan buat catatan tangan."
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSessionModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
