import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Dumbbell, Settings, Activity, LogOut, ClipboardList } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';


interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const navItems = [
    { icon: Users, label: 'Alunos', path: '/clients' },
    { icon: ClipboardList, label: 'Avaliações', path: '/assessments' },
    { icon: Dumbbell, label: 'Treinos', path: '/workouts' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const { signOut, profile } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-40 md:hidden backdrop-blur-sm animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="text-primary-500 w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-white">VolumeLoad</span>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <LogOut className="rotate-180" size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive
                  ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'TR'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">
                {profile?.full_name || 'Treinador'}
              </span>
              <span className="text-xs text-slate-500">Plano Pro</span>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center space-x-3 px-2 w-full text-slate-500 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;