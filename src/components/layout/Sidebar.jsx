import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Bot,
  Layers,
  HelpCircle,
  GraduationCap,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { profile, levelInfo, setOnboardingOpen } = useAuth();

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Perpustakaan Saya', icon: BookOpen },
    { to: '/tutor', label: 'AI Tutor', icon: Bot, badge: 'Interaktif' },
    { to: '/flashcards', label: 'Smart Flashcards', icon: Layers },
    { to: '/exam-practice', label: 'Latihan Ujian', icon: GraduationCap },
    { to: '/planner', label: 'Jadwal Belajar', icon: Calendar },
    { to: '/analytics', label: 'Analisis Belajar', icon: BarChart3 },
    { to: '/settings', label: 'Pengaturan', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Mobile Header with close button */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
          <span className="font-bold text-sm text-slate-900">StudyForge AI</span>
        </div>
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Action Button: "Buat Materi Baru" */}
      <div className="p-4">
        <Link
          to="/lesson/new"
          onClick={onCloseMobile}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-violet-600 hover:from-brand-500 hover:to-violet-500 text-white font-medium text-sm shadow-card hover:shadow-elevated transition-all active:scale-[0.98] group"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
          <span>Buat Materi Baru</span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-subtle'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Profile / Study Target Progress Card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 m-3 rounded-2xl border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-800">Target Belajar</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            {profile?.weeklyGoalMinutes || 240} mnt/mgg
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round(((levelInfo.currentXp % 300) / 300) * 100))}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>Level {levelInfo.level} • {levelInfo.title}</span>
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              setOnboardingOpen(true);
            }}
            className="text-brand-600 hover:underline font-medium"
          >
            Ubah
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full shadow-elevated animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
