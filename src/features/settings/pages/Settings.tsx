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
    <div className="p-6 md:p-8 max-w-4xl mx-auto text-slate-50">
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="text-primary-500" />
            Perfil do Usuário
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gerencie suas informações pessoais.</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
            <div className="relative">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                placeholder="Seu nome completo"
              />
              <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
            <div className="relative opacity-60 cursor-not-allowed">
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 px-4 text-slate-400"
              />
              <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
            <p className="text-xs text-slate-500 mt-1">O email não pode ser alterado.</p>
          </div>

          {/* Role (Readonly) */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo de Conta</label>
            <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800 rounded-lg w-max">
              <Shield size={16} className="text-primary-500" />
              <span className="text-sm font-medium capitalize text-slate-300">
                {profile?.role === 'trainer' ? 'Treinador' : 'Aluno'}
              </span>
            </div>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
              {message.type === 'success' ? <Check size={18} /> : null}
              <span>{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-lg transition-colors border border-slate-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Salvar
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