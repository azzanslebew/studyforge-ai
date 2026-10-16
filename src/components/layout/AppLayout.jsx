import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { OnboardingModal } from '../ui/OnboardingModal';
import { useAuth } from '../../contexts/AuthContext';

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { onboardingOpen, setOnboardingOpen } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />

      <div className="flex-1 flex w-full">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </div>
  );
}
