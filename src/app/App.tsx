import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Menu, Activity } from 'lucide-react';
import Sidebar from '@/shared/components/Sidebar';
import Clients from '@/features/clients/pages/Clients';
import ClientProfile from '@/features/clients/pages/ClientProfile';
import WorkoutSession from '@/features/workouts/pages/WorkoutSession';
import Workouts from '@/features/workouts/pages/Workouts';
import Settings from '@/features/settings/pages/Settings';
import AssessmentsPage from '@/features/assessments/pages/AssessmentsPage';
import { useDataSeeder } from '@/shared/hooks/useDataSeeder';

// Desktop Layout with Sidebar (Fixed Dark Mode)
const DesktopLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-950 text-surface-50 font-sans selection:bg-primary-500/30">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 md:ml-64 transition-all duration-300 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-surface-800 bg-surface-950/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center space-x-2">
            <Activity className="text-primary-500 w-6 h-6" />
            <span className="text-lg font-bold tracking-tight text-white font-display">VolumeLoad</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-surface-400 hover:text-white p-1">
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// Full screen layout for immersive session (Fixed Dark Mode)
const SessionLayout: React.FC = () => {
  return (
    <div className="bg-surface-950 min-h-screen text-surface-50 font-sans selection:bg-primary-500/30">
      <Outlet />
    </div>
  );
};

import { useAuth } from './providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';
import LoginScreen from '@/features/auth/pages/LoginScreen';
import ChangePasswordScreen from '@/features/auth/pages/ChangePasswordScreen';
import StudentApp from '@/features/student/StudentApp';

const App: React.FC = () => {
  const { user, role, loading } = useAuth();

  // --- DATA SEEDER (Keep for Trainer Demo) ---
  useDataSeeder(user, role);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-surface-500 text-sm animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Force Password Change Check
  if (user.user_metadata?.force_password_change) {
    return <ChangePasswordScreen />;
  }

  if (role === 'student') {
    return <StudentApp />;
  }

  // Use a strict check for trainer role or generic error if role is missing
  if (!role) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-8 text-center text-white">
        <h1 className="text-2xl font-bold mb-4 text-accent-error">Erro de Perfil</h1>
        <p className="text-surface-400 mb-6">Não foi possível carregar o perfil de usuário.</p>
        <div className="bg-surface-900 p-4 rounded-lg mb-6 border border-surface-800 text-sm font-mono text-left">
          <p>Status: Logado</p>
          <p>Email: {user?.email}</p>
          <p>Role: Não definido</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="bg-surface-800 hover:bg-surface-700 text-white px-6 py-2 rounded-lg transition-colors border border-surface-700"
        >
          Sair e Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Main Management Routes */}
        <Route element={<DesktopLayout />}>
          {/* Redirect root to clients since dashboard is removed */}
          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Standalone Session Route (Mobile optimized) */}
        <Route element={<SessionLayout />}>
          <Route path="/session/new" element={<WorkoutSession />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;