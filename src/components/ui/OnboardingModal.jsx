import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input, Select } from './Input';
import { useToast } from '../../contexts/ToastContext';
import { GraduationCap, Sparkles, BookOpen, Clock, HeartHandshake } from 'lucide-react';

export function OnboardingModal({ isOpen, onClose }) {
  const { profile, updateProfile, awardXp } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || 'Pelajar Cerdas');
  const [educationLevel, setEducationLevel] = useState(profile?.educationLevel || 'Universitas (S1)');
  const [university, setUniversity] = useState(profile?.university || '');
  const [selectedSubjects, setSelectedSubjects] = useState(profile?.subjects || ['Umum']);
  const [weeklyGoalMinutes, setWeeklyGoalMinutes] = useState(profile?.weeklyGoalMinutes || 300);
  const [explanationStyle, setExplanationStyle] = useState(profile?.explanationStyle || 'Lengkap & Akademis');
  const [newSubject, setNewSubject] = useState('');

  // Sync state whenever profile or modal open state changes
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || 'Pelajar Cerdas');
      setEducationLevel(profile.educationLevel || 'Universitas (S1)');
      setUniversity(profile.university || '');
      setSelectedSubjects(profile.subjects && profile.subjects.length > 0 ? profile.subjects : ['Umum']);
      setWeeklyGoalMinutes(profile.weeklyGoalMinutes || 300);
      setExplanationStyle(profile.explanationStyle || 'Lengkap & Akademis');
    }
  }, [profile, isOpen]);

  const educationLevels = [
    'SMA / SMK / MA',
    'Universitas (D3 / D4)',
    'Universitas (S1)',
    'Pascasarjana (S2 / S3)',
    'Pembelajar Mandiri / Profesional'
  ];

  const explanationStyles = [
    { value: 'Sederhana & Mudah Dipahami', desc: 'Penjelasan analogis tanpa jargon berbelit-belit.' },
    { value: 'Lengkap & Akademis', desc: 'Mendalam, formal, lengkap dengan teori & literatur.' },
    { value: 'Langkah demi Langkah', desc: 'Metodologis, poin per poin, sangat sistematis.' },
    { value: 'Berdasarkan Contoh Nyata', desc: 'Banyak studi kasus industri dan kehidupan sehari-hari.' }
  ];

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    if (!selectedSubjects.includes(newSubject.trim())) {
      setSelectedSubjects(prev => [...prev, newSubject.trim()]);
    }
    setNewSubject('');
  };

  const handleRemoveSubject = (subj) => {
    setSelectedSubjects(prev => prev.filter(s => s !== subj));
  };

  const handleSave = async () => {
    await updateProfile({
      displayName,
      educationLevel,
      university,
      subjects: selectedSubjects.length > 0 ? selectedSubjects : ['Umum'],
      weeklyGoalMinutes: Number(weeklyGoalMinutes),
      explanationStyle,
    });

    await awardXp(20, 'Menyelesaikan Pengaturan Profil Belajar');
    showToast('Profil dan preferensi belajar berhasil disimpan! (+20 XP)', 'success');
    if (onClose) onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil & Preferensi Belajar"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6 text-sm">
        {/* Banner */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-100 text-brand-950">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Personalisasi Pengalaman Belajar Anda</h4>
            <p className="text-xs text-slate-600 mt-0.5">StudyForge AI akan menyesuaikan respon tutor dan materi berdasarkan profil ini.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nama Panggilan / Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="misal: Siti Rahma"
          />

          <Select
            label="Jenjang Pendidikan"
            value={educationLevel}
            onChange={(e) => setEducationLevel(e.target.value)}
          >
            {educationLevels.map(lvl => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </Select>

          <Input
            label="Universitas / Sekolah"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            placeholder="misal: Universitas Indonesia, ITB, dsb."
          />

          <Select
            label="Target Belajar Mingguan"
            value={weeklyGoalMinutes}
            onChange={(e) => setWeeklyGoalMinutes(Number(e.target.value))}
          >
            <option value={120}>2 Jam / Minggu (Santai)</option>
            <option value={240}>4 Jam / Minggu (Sedang)</option>
            <option value={360}>6 Jam / Minggu (Fokus)</option>
            <option value={600}>10 Jam / Minggu (Intensif)</option>
          </Select>
        </div>

        {/* Subjects list */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Mata Kuliah / Subjek yang Sedang Dipelajari
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSubjects.map(subj => (
              <span
                key={subj}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200"
              >
                <span>{subj}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubject(subj)}
                  className="text-brand-400 hover:text-brand-600 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Ketik mata kuliah baru (misal: Algoritma, Biokimia)..."
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubject(e);
                }
              }}
            />
            <Button size="sm" variant="outline" onClick={handleAddSubject}>
              Tambah
            </Button>
          </div>
        </div>

        {/* Explanation Style */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Gaya Penjelasan AI Tutor Favorit
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {explanationStyles.map(style => (
              <div
                key={style.value}
                onClick={() => setExplanationStyle(style.value)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  explanationStyle === style.value
                    ? 'border-brand-500 bg-brand-50/50 shadow-sm ring-1 ring-brand-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-xs text-slate-900">{style.value}</div>
                <div className="text-[11px] text-slate-500 mt-1">{style.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Simpan Perubahan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
