import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { NewLessonPage } from './pages/NewLessonPage';
import { LessonDetailPage } from './pages/LessonDetailPage';
import { TutorPage } from './pages/TutorPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { QuizPage } from './pages/QuizPage';
import { ExamPracticePage } from './pages/ExamPracticePage';
import { PlannerPage } from './pages/PlannerPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Protected / Main App Layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/lesson/new" element={<NewLessonPage />} />
          <Route path="/lesson/:id" element={<LessonDetailPage />} />
          <Route path="/tutor" element={<TutorPage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/exam-practice" element={<ExamPracticePage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback to Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
