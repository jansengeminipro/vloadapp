import React, { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Client, MuscleGroup } from '@/shared/types';
import { safeGetMonday, normalizeMuscleForChart } from '@/shared/utils/analytics';
import { getExerciseByName } from '@/shared/data/exercises';
import { supabase } from '@/shared/lib/supabase';
import { useAuth } from '@/app/providers/AuthProvider';
import { useClientProfileData } from '../hooks/useClientProfileData';

// Sub-components
import ClientHeader from '../components/ClientHeader';
import ClientStats from '../components/ClientStats';
import ClientProgram from '../sections/ClientProgram';
import ClientAnalytics from '../sections/ClientAnalytics';
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

    // Stats Local State (Lifted for ClientStats)
    const [progDistributionMetric, setProgDistributionMetric] = useState<'sets' | 'load'>('sets');


    // Dashboard Stats Logic (Kept here to pass to ClientStats, could be extracted to hook)
    const completedSessions = useMemo(() => {
        return sessions.filter(s => s.status === 'completed');
    }, [sessions]);

    const activeProgramWorkouts = useMemo(() => {
        if (!client?.activeProgram) return [];
        return allTemplates.filter(t => client.activeProgram!.workoutIds.includes(t.id));
    }, [client?.activeProgram, allTemplates]);

    const dashboardStats = useMemo(() => {
        if (!client?.activeProgram) return null;
        const now = new Date();
        const currentWeekStart = safeGetMonday(now);
        const nextWeekStart = new Date(currentWeekStart);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);

        const lastWeekStart = new Date(currentWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(currentWeekStart);

        const mesoStart = new Date(client.activeProgram.startDate);
        const mesoEnd = client.activeProgram.endDate ? new Date(client.activeProgram.endDate) : now;

        // Process sessions once to avoid repeated Date object creation
        const processedSessions = completedSessions.map(s => ({
            ...s,
            dateObj: new Date(s.date)
        }));

        const weekSessions = processedSessions.filter(s => s.dateObj >= currentWeekStart && s.dateObj < nextWeekStart);
        const lastWeekSessions = processedSessions.filter(s => s.dateObj >= lastWeekStart && s.dateObj < lastWeekEnd);
        const mesoSessions = processedSessions.filter(s => s.dateObj >= mesoStart && s.dateObj <= mesoEnd);

        const schedule: Record<string, number[]> = client.activeProgram?.schedule || {};
        const plannedWeeklySessions = Object.values(schedule).reduce((acc: number, days: any) => acc + (Array.isArray(days) ? days.length : 0), 0) || activeProgramWorkouts.length;

        const weeksCount = Math.max(1, Math.ceil(Math.abs(mesoEnd.getTime() - mesoStart.getTime()) / (1000 * 60 * 60 * 24 * 7)));
        const plannedMesocycleSessions = plannedWeeklySessions * weeksCount;

        const plannedWeeklySets = activeProgramWorkouts.reduce((acc, t) => {
            const daysCount = (schedule[t.id] || []).length || 1;
            const setsInWorkout = t.exercises.reduce((exAcc, ex) => exAcc + ex.sets, 0);
            return acc + (setsInWorkout * daysCount);
        }, 0);

        const currentWeeklySets = weekSessions.reduce((acc, s) => acc + s.totalSets, 0);

        // Muscle Volume Distribution
        const weeklyMuscleVolume: Record<string, number> = {};
        const distMap: Record<string, number> = {};
        const prevDistMap: Record<string, number> = {};

        const processSessionForDist = (sessions: any[], targetMap: Record<string, number>, volumeMap?: Record<string, number>) => {
            sessions.forEach(s => {
                s.details.forEach((d: any) => {
                    const sets = d.sets || 0;
                    let distValue = 0;
                    if (progDistributionMetric === 'sets') {
                        distValue = sets;
                    } else {
                        distValue = d.setDetails && Array.isArray(d.setDetails)
                            ? d.setDetails.reduce((acc: number, set: any) => acc + ((parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)), 0)
                            : (d.volumeLoad || 0);
                    }

                    const exerciseDef = getExerciseByName(d.name);
                    if (exerciseDef) {
                        const agonists = exerciseDef.agonists?.length > 0 ? exerciseDef.agonists : [d.muscleGroup];
                        agonists.forEach(raw => {
                            const m = normalizeMuscleForChart(raw);
                            if (m) {
                                if (volumeMap) volumeMap[m] = (volumeMap[m] || 0) + sets;
                                targetMap[m] = (targetMap[m] || 0) + distValue;
                            }
                        });
                        if (exerciseDef.synergists) {
                            exerciseDef.synergists.forEach(raw => {
                                const m = normalizeMuscleForChart(raw);
                                if (m) {
                                    if (volumeMap) volumeMap[m] = (volumeMap[m] || 0) + (sets * 0.5);
                                    targetMap[m] = (targetMap[m] || 0) + (distValue * 0.5);
                                }
                            });
                        }
                    } else if (d.muscleGroup) {
                        const m = normalizeMuscleForChart(d.muscleGroup);
                        if (m) {
                            if (volumeMap) volumeMap[m] = (volumeMap[m] || 0) + sets;
                            targetMap[m] = (targetMap[m] || 0) + distValue;
                        }
                    }
                });
            });
        };

        processSessionForDist(weekSessions, distMap, weeklyMuscleVolume);
        processSessionForDist(lastWeekSessions, prevDistMap);

        const muscleDistributionData = Object.keys(distMap).map(m => ({
            name: m,
            value: distMap[m],
            prevValue: prevDistMap[m] || 0
        })).sort((a, b) => b.value - a.value);

        return {
            weekSessionsCount: weekSessions.length,
            mesocycleSessionsCount: mesoSessions.length,
            plannedWeeklySessions,
            plannedMesocycleSessions,
            currentWeeklySets,
            plannedWeeklySets,
            weeklyMuscleVolume,
            muscleDistributionData
        };
    }, [completedSessions, activeProgramWorkouts, client, progDistributionMetric]);

    // Profile Management
    const handleSaveProfile = async () => {
        if (!client || !user) return;
        try {
            const { error, status } = await supabase
                .from('profiles')
                .update({
                    full_name: profileForm.name,
                    birth_date: profileForm.birthDate,
                    weight: profileForm.weight,
                    height: profileForm.height,
                    phone: profileForm.phone,
                    gender: profileForm.gender
                })
                .eq('id', client.id);

            if (error) throw error;

            // Note: status 204 or 200 with no error means the query executed, 
            // but RLS might have prevented actual row updates if policies weren't met.
            // Since we added the policy, this should now work.

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