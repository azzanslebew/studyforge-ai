import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AiStatusBadge } from '../ui/AiStatusBadge';
import { Flame, Award, Menu, User, BookOpen, Settings as SettingsIcon } from 'lucide-react';

export function Navbar({ onToggleMobileSidebar }) {
  const { profile, levelInfo, setOnboardingOpen } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();

  const isLanding = location.pathname === '/';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Mobile burger & Logo */}
      <div className="flex items-center gap-3">
        {!isLanding && (
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl lg:hidden focus:outline-none"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link to={isLanding ? '/' : '/dashboard'} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-violet-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <img src="/logo.svg" alt="StudyForge AI" className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                StudyForge
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-brand-100 text-brand-700">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-0.5">Learn Smarter. Understand Deeper.</p>
          </div>
        </Link>
      </div>

      {/* Right side: AI Status, Streak, Level/XP, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* AI Integration Status */}
        <AiStatusBadge />

        {/* Gamification Streak & XP (Only on App screens) */}
        {!isLanding && profile && (
          <>
            {/* Streak */}
            <div
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/70 text-amber-800 rounded-full text-xs font-semibold cursor-pointer hover:bg-amber-100 transition-colors"
              title={`Streak Belajar: ${profile.streak || 1} Hari berturut-turut!`}
              onClick={() => setOnboardingOpen(true)}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{profile.streak || 1} Hari</span>
            </div>

            {/* Level / XP Pill */}
            <div
              className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200/70 text-brand-800 rounded-full text-xs font-semibold cursor-pointer hover:bg-indigo-100 transition-colors"
              title={`${levelInfo.currentXp} XP (${levelInfo.xpToNext} XP menuju level berikutnya)`}
              onClick={() => setOnboardingOpen(true)}
            >
              <Award className="w-4 h-4 text-brand-600" />
              <span>Lv. {levelInfo.level} {levelInfo.title}</span>
              <div className="w-12 h-1.5 bg-brand-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${levelInfo.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* User Profile Avatar / Trigger with Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-all text-left"
                title="Menu Pengguna"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                  {(profile.displayName || 'P').charAt(0)}
                </div>
                <span className="text-xs font-medium text-slate-700 hidden sm:inline max-w-[100px] truncate">
                  {profile.displayName || 'Profil'}
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-elevated border border-slate-200/90 py-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-slate-100 space-y-1">
                      <div className="font-bold text-sm text-slate-900 truncate">
                        {profile.displayName || 'Pelajar Cerdas'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {profile.university || profile.educationLevel || 'Universitas'}
                      </div>
                      <div className="pt-1.5 flex items-center justify-between text-[11px] font-semibold text-brand-700">
                        <span>Level {levelInfo.level} ({levelInfo.title})</span>
                        <span className="text-amber-600">🔥 {profile.streak || 1} Hari</span>
                      </div>
                    </div>

                    {/* Menu Links */}
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setOnboardingOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
                      >
                        <User className="w-4 h-4 text-brand-600" />
                        <span>Edit Profil & Gaya Belajar (Pop-up)</span>
                      </button>

                      <Link
                        to="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
                      >
                        <SettingsIcon className="w-4 h-4 text-slate-500" />
                        <span>Halaman Pengaturan Lengkap</span>
                      </Link>

                      <Link
                        to="/analytics"
                        onClick={() => setProfileMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium"
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Statistik & Lencana Prestasi</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {isLanding && (
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center font-medium text-xs sm:text-sm px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
            >
              Buka Dashboard
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
