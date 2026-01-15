import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Client, MuscleGroup } from '@/shared/types';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProvider';
import { useClientProfileData } from '../hooks/useClientProfileData';

import { useClientDashboardStats } from '../hooks/profile/useClientDashboardStats';
import { updateClientProfile } from '@/services/clientService';

// Sub-components
import ClientHeader from '../components/ClientHeader';
import ClientStats from '../components/ClientStats';
import ClientProgram from '../sections/ClientProgram';
import ClientAnalytics from '../sections/analytics';
import ClientHistory from '../sections/ClientHistory';
import ClientDashboard from '../sections/ClientDashboard';
import AssessmentsTab from '../../assessments/pages/AssessmentsTab';

const ClientProfile: React.FC = () => {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    // Data Hook (Replaces previous local state & useEffect)
    const {
        client, setClient,
        sessions, setSessions,
        allTemplates,
        latestAssessment,
        loading
    } = useClientProfileData(id, user?.id);

    const activeTab = (searchParams.get('tab') as 'dashboard' | 'program' | 'analytics' | 'history' | 'assessments') || 'dashboard';

    const handleTabChange = (tab: string) => {
        setSearchParams({ tab }, { replace: true });
    };

    // Global UI State
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [profileForm, setProfileForm] = useState<Partial<Client>>({});

    // Dashboard Stats Logic
    const {
        dashboardStats,
        progDistributionMetric,
        setProgDistributionMetric,
        completedSessions
    } = useClientDashboardStats(client, sessions, allTemplates);



    // Profile Management
    const handleSaveProfile = async () => {
        if (!client || !user) return;
        try {
            await updateClientProfile(client.id, profileForm);

            // Note: services/clientService.updateClientProfile returns the data, 
            // but we construct the optimistic update here anyway.

            const updated = {
                ...client,
                ...profileForm,
                // Refresh local avatar initials if using the UI-Avatars service
                avatarUrl: (client.avatarUrl || '').includes('ui-avatars.com')
                    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(profileForm.name || 'User')}&background=random`
                    : client.avatarUrl
            };
            setClient(updated as Client);
            setShowEditProfileModal(false);
            alert('Perfil atualizado com sucesso!');
        } catch (err: any) {
            console.error('Update profile error:', err);
            alert('Erro ao atualizar perfil: ' + err.message);
        }
    };

    if (!client) return <div className="p-8 text-center text-slate-500">Carregando...</div>;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <ClientHeader client={client} onEditProfile={() => { setProfileForm(client); setShowEditProfileModal(true); }} />

            <div className="flex gap-8 border-b border-slate-700 overflow-x-auto">
                {['dashboard', 'program', 'assessments', 'analytics', 'history'].map((t) => (
                    <button key={t} onClick={() => handleTabChange(t)} className={`pb-4 text-sm font-medium capitalize whitespace-nowrap ${activeTab === t ? 'text-primary-400 border-b-2 border-primary-500' : 'text-slate-400'}`}>
                        {t === 'dashboard' ? 'Início' : t === 'program' ? 'Programa' : t === 'assessments' ? 'Avaliações' : t === 'analytics' ? 'Análises' : 'Histórico'}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px]">
                {activeTab === 'dashboard' && dashboardStats && client.activeProgram && (
                    <ClientDashboard
                        activeProgram={client.activeProgram}
                        dashboardStats={dashboardStats}
                        latestAssessment={latestAssessment}
                        completedSessions={completedSessions}
                        progDistributionMetric={progDistributionMetric}
                        setProgDistributionMetric={setProgDistributionMetric}
                    />
                )}

                {activeTab === 'program' && (
                    <ClientProgram
                        client={client}
                        setClient={setClient}
                        allTemplates={allTemplates}
                    />
                )}

                {activeTab === 'assessments' && <AssessmentsTab client={client} />}

                {activeTab === 'analytics' && (
                    <ClientAnalytics sessions={completedSessions} />
                )}

                {activeTab === 'history' && (
                    <ClientHistory sessions={sessions} setSessions={setSessions} />
                )}
            </div>

            {/* Global Modals */}
            {showEditProfileModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Editar Perfil</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nome</label>
                                <input type="text" value={profileForm.name || ''} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</label>
                                <input type="email" value={profileForm.email || ''} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none" placeholder="exemplo@email.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone</label><input type="tel" value={profileForm.phone || ''} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none" /></div>
                                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nascimento</label><input type="date" value={profileForm.birthDate || ''} onChange={e => setProfileForm({ ...profileForm, birthDate: e.target.value })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none [color-scheme:dark]" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Peso (kg)</label><input type="number" value={profileForm.weight || ''} onChange={e => setProfileForm({ ...profileForm, weight: parseFloat(e.target.value) })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none" /></div>
                                <div><label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Altura (cm)</label><input type="number" value={profileForm.height || ''} onChange={e => setProfileForm({ ...profileForm, height: parseFloat(e.target.value) })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gênero</label>
                                <select value={profileForm.gender || 'male'} onChange={e => setProfileForm({ ...profileForm, gender: e.target.value as any })} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-primary-500 focus:outline-none">
                                    <option value="male">Masculino</option>
                                    <option value="female">Feminino</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setShowEditProfileModal(false)} className="text-slate-400 hover:text-white px-4 py-2">Cancelar</button>
                                <button onClick={handleSaveProfile} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium">Salvar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientProfile;