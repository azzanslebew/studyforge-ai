import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  FolderPlus,
  Folder,
  Star,
  Archive,
  Trash2,
  PlusCircle,
  Grid,
  List as ListIcon,
  Bot,
  Layers,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { db } from '../services/db';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';

export function LibraryPage() {
  const { showToast } = useToast();
  const [lessons, setLessons] = useState([]);
  const [folders, setFolders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedFolderId, setSelectedFolderId] = useState('ALL');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Modals
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [deleteConfirmLesson, setDeleteConfirmLesson] = useState(null);
  const [moveLessonModal, setMoveLessonModal] = useState(null);
  const [targetFolderId, setTargetFolderId] = useState('');

  const loadData = async () => {
    try {
      const allLessons = await db.lessons.toArray();
      const allFolders = await db.folders.toArray();
      setLessons(allLessons);
      setFolders(allFolders);
    } catch (err) {
      console.error('Error loading library:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter & Search Logic
  const subjects = ['ALL', ...Array.from(new Set(lessons.map(l => l.subject || 'Umum')))];

  const filteredLessons = lessons.filter(lesson => {
    // Search
    const query = searchQuery.toLowerCase();
    const matchSearch =
      lesson.title?.toLowerCase().includes(query) ||
      lesson.overview?.toLowerCase().includes(query) ||
      lesson.subject?.toLowerCase().includes(query);

    // Subject
    const matchSubject = selectedSubject === 'ALL' || lesson.subject === selectedSubject;

    // Folder
    const matchFolder =
      selectedFolderId === 'ALL' ||
      (selectedFolderId === 'UNFOLDERED' ? !lesson.folderId : lesson.folderId === selectedFolderId);

    return matchSearch && matchSubject && matchFolder && !lesson.isArchived;
  });

  // Sort
  filteredLessons.sort((a, b) => {
    if (sortBy === 'title') {
      return (a.title || '').localeCompare(b.title || '');
    }
    if (sortBy === 'completion') {
      return (b.isCompleted ? 1 : 0) - (a.isCompleted ? 1 : 0);
    }
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  // Actions
  const handleToggleFavorite = async (lesson, e) => {
    e.stopPropagation();
    e.preventDefault();
    const newFav = !lesson.isFavorite;
    await db.lessons.update(lesson.id, { isFavorite: newFav });
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, isFavorite: newFav } : l));
    showToast(newFav ? 'Materi ditambahkan ke Favorit' : 'Dihapus dari Favorit', 'info');
  };

  const handleToggleCompleted = async (lesson, e) => {
    e.stopPropagation();
    e.preventDefault();
    const newComp = !lesson.isCompleted;
    await db.lessons.update(lesson.id, { isCompleted: newComp });
    setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, isCompleted: newComp } : l));
    showToast(newComp ? 'Materi ditandai Selesai Dipelajari' : 'Materi ditandai Belum Selesai', 'info');
  };

  const handleDeleteLesson = async () => {
    if (!deleteConfirmLesson) return;
    await db.lessons.delete(deleteConfirmLesson.id);
    setLessons(prev => prev.filter(l => l.id !== deleteConfirmLesson.id));
    showToast(`Materi "${deleteConfirmLesson.title}" berhasil dihapus.`, 'info');
    setDeleteConfirmLesson(null);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    const newFolder = {
      id: `f_${Date.now()}`,
      name: folderName.trim(),
      color: '#6366f1',
      createdAt: new Date().toISOString()
    };
    await db.folders.put(newFolder);
    setFolders(prev => [...prev, newFolder]);
    setFolderName('');
    setFolderModalOpen(false);
    showToast(`Folder "${newFolder.name}" berhasil dibuat.`, 'success');
  };

  const handleMoveLesson = async () => {
    if (!moveLessonModal) return;
    await db.lessons.update(moveLessonModal.id, { folderId: targetFolderId || null });
    setLessons(prev => prev.map(l => l.id === moveLessonModal.id ? { ...l, folderId: targetFolderId || null } : l));
    showToast('Materi berhasil dipindahkan.', 'success');
    setMoveLessonModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Perpustakaan Saya</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola seluruh catatan kuliah, ringkasan materi, dan bahan belajar terstruktur Anda.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={FolderPlus} onClick={() => setFolderModalOpen(true)}>
            Folder Baru
          </Button>
          <Link to="/lesson/new">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Buat Materi Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Folders Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedFolderId('ALL')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 border transition-all ${
            selectedFolderId === 'ALL'
              ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Semua Materi ({lessons.length})</span>
        </button>

        {folders.map(f => {
          const count = lessons.filter(l => l.folderId === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 border transition-all ${
                selectedFolderId === f.id
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedFolderId === f.id ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-subtle flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi berdasarkan judul, konsep, atau kata kunci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            {subjects.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'Semua Mata Kuliah' : s}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="updatedAt">Terakhir Diperbarui</option>
            <option value="title">Judul (A-Z)</option>
            <option value="completion">Status Penyelesaian</option>
          </select>

          {/* Grid / List toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}
              title="Tampilan Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400'}`}
              title="Tampilan List"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lessons List / Grid */}
      {filteredLessons.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-subtle space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="text-base font-semibold text-slate-800">Tidak ada materi yang sesuai</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `Tidak ditemukan materi dengan kata kunci "${searchQuery}". Coba kata kunci lain.` : 'Mulai buat catatan materi kuliah pertama Anda sekarang.'}
          </p>
          <Link to="/lesson/new" className="inline-block mt-2">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Buat Materi Baru
            </Button>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map(lesson => (
            <Card key={lesson.id} hover className="flex flex-col justify-between p-5 space-y-4 group">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="primary" size="sm">{lesson.subject || 'Umum'}</Badge>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleToggleFavorite(lesson, e)}
                      className={`p-1 rounded-md transition-colors ${
                        lesson.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-slate-300 hover:text-amber-500'
                      }`}
                      title={lesson.isFavorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                    >
                      <Star className={`w-4 h-4 ${lesson.isFavorite ? 'fill-amber-500' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleToggleCompleted(lesson, e)}
                      className={`p-1 rounded-md transition-colors ${
                        lesson.isCompleted ? 'text-emerald-600' : 'text-slate-300 hover:text-emerald-500'
                      }`}
                      title={lesson.isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <Link to={`/lesson/${lesson.id}`} className="block">
                  <h3 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2">
                    {lesson.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {lesson.overview || 'Materi pembelajaran terstruktur.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px]">
                  {new Date(lesson.createdAt).toLocaleDateString('id-ID')}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setTargetFolderId(lesson.folderId || '');
                      setMoveLessonModal(lesson);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                    title="Pindahkan ke folder"
                  >
                    <Folder className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmLesson(lesson)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    title="Hapus materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link to={`/lesson/${lesson.id}`}>
                    <Button variant="secondary" size="sm">
                      Buka
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-subtle divide-y divide-slate-100">
          {filteredLessons.map(lesson => (
            <div
              key={lesson.id}
              className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">{lesson.subject || 'Umum'}</Badge>
                  {lesson.isCompleted && (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Selesai
                    </span>
                  )}
                  {lesson.isFavorite && (
                    <span className="text-[11px] text-amber-600 flex items-center gap-0.5 font-medium">
                      <Star className="w-3 h-3 fill-amber-500" /> Favorit
                    </span>
                  )}
                </div>
                <Link to={`/lesson/${lesson.id}`}>
                  <h3 className="font-semibold text-sm text-slate-900 hover:text-brand-600 transition-colors truncate">
                    {lesson.title}
                  </h3>
                </Link>
                <p className="text-xs text-slate-500 truncate">{lesson.overview}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/tutor?lessonId=${lesson.id}`}>
                  <Button variant="outline" size="sm" icon={Bot}>Tutor</Button>
                </Link>
                <Link to={`/lesson/${lesson.id}`}>
                  <Button variant="secondary" size="sm">Buka Catatan</Button>
                </Link>
                <button
                  onClick={() => setDeleteConfirmLesson(lesson)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create Folder */}
      <Modal
        isOpen={folderModalOpen}
        onClose={() => setFolderModalOpen(false)}
        title="Buat Folder Baru"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <Input
            label="Nama Folder"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="misal: Persiapan Ujian Akhir Semester"
            autoFocus
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setFolderModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Buat Folder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Move Lesson */}
      <Modal
        isOpen={Boolean(moveLessonModal)}
        onClose={() => setMoveLessonModal(null)}
        title="Pindahkan Materi ke Folder"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-xs text-slate-600">
            Pilih folder tujuan untuk materi: <strong className="text-slate-900">{moveLessonModal?.title}</strong>
          </p>
          <Select
            label="Pilih Folder"
            value={targetFolderId}
            onChange={(e) => setTargetFolderId(e.target.value)}
          >
            <option value="">(Tanpa Folder / Beranda)</option>
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setMoveLessonModal(null)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={handleMoveLesson}>
              Simpan Perpindahan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmLesson)}
        onClose={() => setDeleteConfirmLesson(null)}
        title="Konfirmasi Hapus Materi"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus materi <strong className="text-slate-900">"{deleteConfirmLesson?.title}"</strong>?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
            Peringatan: Tindakan ini permanen. Seluruh catatan, kartu flashcard, dan kuis yang terhubung dengan materi ini akan terhapus.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmLesson(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteLesson}>
              Hapus Permanen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
