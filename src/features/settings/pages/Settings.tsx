import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';
import { User, Mail, Shield, Save, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setMessage(null);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      // Also update auth metadata for consistency
      await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      await refreshProfile();
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar perfil. Tente novamente.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto text-white animate-in fade-in">
      <h1 className="text-3xl font-bold mb-8 font-display tracking-tight">Configurações</h1>

      <div className="bg-surface-900 border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-white/5 bg-surface-800/30">
          <h2 className="text-xl font-bold flex items-center gap-2 font-display">
            <User className="text-primary-500" />
            Perfil do Usuário
          </h2>
          <p className="text-surface-400 text-sm mt-1">Gerencie suas informações pessoais.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Nome Completo</label>
            <div className="relative group">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-950 border border-white/5 rounded-lg py-3 px-4 pl-10 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-surface-600"
                placeholder="Seu nome completo"
              />
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-primary-500 transition-colors" />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Email</label>
            <div className="relative opacity-60 cursor-not-allowed">
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="w-full bg-surface-950 border border-white/5 rounded-lg py-3 px-4 pl-10 text-surface-400"
              />
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
            </div>
            <p className="text-[10px] text-surface-500 mt-1 uppercase font-bold tracking-wider">O email não pode ser alterado.</p>
          </div>

          {/* Role (Readonly) */}
          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Tipo de Conta</label>
            <div className="flex items-center gap-2 p-3 bg-surface-950 border border-white/5 rounded-lg w-max pr-6">
              <div className="p-1.5 bg-primary-500/10 rounded-md">
                <Shield size={16} className="text-primary-500" />
              </div>
              <span className="text-sm font-bold capitalize text-white">
                {profile?.role === 'trainer' ? 'Treinador' : 'Aluno'}
              </span>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
              {message.type === 'success' ? <Check size={18} /> : null}
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white font-medium py-2.5 px-6 rounded-lg transition-colors border border-white/5 disabled:opacity-50 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-500 text-white font-medium py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 hover:scale-105 active:scale-95 text-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;