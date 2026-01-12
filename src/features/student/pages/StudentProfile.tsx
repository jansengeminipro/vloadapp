import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';
import { User, Calendar, Ruler, Weight, Save, Check, ChevronLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentProfile: React.FC = () => {
    const { user, profile, refreshProfile, signOut } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: '',
        birth_date: '',
        height: '',
        weight: ''
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                birth_date: profile.birth_date || '',
                height: profile.height?.toString() || '',
                weight: profile.weight?.toString() || ''
            });
        }
    }, [profile]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            const updates = {
                full_name: formData.full_name,
                birth_date: formData.birth_date || null,
                height: formData.height ? parseFloat(formData.height) : null,
                weight: formData.weight ? parseFloat(formData.weight) : null,
                updated_at: new Date()
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            // Also update auth metadata for full_name sync
            if (formData.full_name !== profile?.full_name) {
                await supabase.auth.updateUser({
                    data: { full_name: formData.full_name }
                });
            }

            await refreshProfile();
            setMessage({ type: 'success', text: 'Perfil atualizado!' });

            // Auto hide success after 3s
            setTimeout(() => setMessage(null), 3000);

        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar. Verifique os dados.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-24 text-slate-50">
            {/* Mobile Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-800 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">Meu Perfil</h1>
                <div className="w-10"></div> {/* Spacer for center alignment */}
            </div>

            <div className="p-6 max-w-lg mx-auto space-y-6">

                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-primary-500 flex items-center justify-center text-3xl font-bold text-primary-500 mb-4 shadow-lg shadow-primary-500/10">
                        {formData.full_name ? formData.full_name.substring(0, 2).toUpperCase() : 'AL'}
                    </div>
                    <p className="text-slate-400 text-sm">{user?.email}</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nome</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Seu nome"
                            />
                            <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    {/* Birth Date */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Data de Nascimento</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={formData.birth_date}
                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Height */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Altura (cm)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.height}
                                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="175"
                                />
                                <Ruler size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Peso (kg)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={formData.weight}
                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-4 px-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="75.5"
                                />
                                <Weight size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Message */}
                {message && (
                    <div className={`p-4 rounded-xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'
                        }`}>
                        {message.type === 'success' ? <Check size={18} /> : null}
                        <span className="font-medium">{message.text}</span>
                    </div>
                )}

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-primary-600/20 mt-8 disabled:opacity-50"
                >
                    {saving ? 'Salvando...' : 'Salvar'}
                </button>

                {/* Logout Button */}
                <button
                    onClick={signOut}
                    className="w-full mt-4 bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-red-500/10 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-800"
                >
                    <LogOut size={20} />
                    Sair da Conta
                </button>
            </div>
        </div>
    );
};

export default StudentProfile;
