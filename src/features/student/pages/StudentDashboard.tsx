import React, { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { supabase } from '@/shared/lib/supabase';
import { Play, Calendar, History, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeProgram, setActiveProgram] = useState<any>(null);
    const [nextWorkout, setNextWorkout] = useState<any>(null);

    useEffect(() => {
        if (!user) return;
        fetchStudentData();
    }, [user]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            // Fetch Active Program
            const { data: program } = await supabase
                .from('client_programs')
                .select('*')
                .eq('client_id', user?.id)
                .eq('is_active', true)
                .single();

            if (program) {
                setActiveProgram(program);
                // Determine Next Workout Logic
                // Simple version: Just pick the first one scheduled for 'Today' or just the first in the list
                // Need to fetch Templates to know names
                const schedule = program.schedule_json || {};
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                // Note: weekday names need to match keys in schedule (monday, tuesday...)
                // We used short names in constants? Let's check. 
                // Assuming keys are IDs for now, actually schedule_json mapping is TemplateID -> [Days] usually?
                // Or Day -> [TemplateIDs]?
                // Implementation Plan didn't strictly specify, but earlier ClientProgram used TemplateID keys.

                // Let's just fetch ALL templates in the program
                const templateIds = new Set<string>();
                Object.values(schedule).forEach((val: any) => {
                    if (Array.isArray(val)) val.forEach(id => templateIds.add(id));
                    // If keys are templates, then keys are IDs
                });
                // Actually in ClientProgram.tsx we saved: { [templateId]: ['monday', 'wednesday'] }
                const assignedTemplateIds = Object.keys(schedule);

                if (assignedTemplateIds.length > 0) {
                    const { data: templates } = await supabase
                        .from('workout_templates')
                        .select('*')
                        .in('id', assignedTemplateIds);

                    if (templates && templates.length > 0) {
                        // Pick the first one for now as "Next Workout"
                        setNextWorkout(templates[0]);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="bg-slate-900 p-6 rounded-b-3xl border-b border-slate-800 shadow-xl">
                <div className="flex justify-between items-start mb-6">
                    <div onClick={() => navigate('/profile')} className="cursor-pointer group">
                        <h1 className="text-2xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors flex items-center gap-2">
                            Olá, {user?.user_metadata.full_name?.split(' ')[0] || 'Aluno'}
                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors">
                                {user?.user_metadata.full_name ? user.user_metadata.full_name.substring(0, 2).toUpperCase() : 'AL'}
                            </div>
                        </h1>
                        <p className="text-slate-400 text-sm">Toque para ver perfil</p>
                    </div>
                    <button onClick={signOut} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                        <LogOut size={18} />
                    </button>
                </div>

                {/* Next Workout Card */}
                {loading ? (
                    <div className="animate-pulse h-32 bg-slate-800 rounded-2xl"></div>
                ) : nextWorkout ? (
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Play size={100} />
                        </div>
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-bold mb-3 backdrop-blur-sm">PROXIMO TREINO</span>
                            <h2 className="text-2xl font-bold mb-1">{nextWorkout.name}</h2>
                            <p className="text-primary-100 text-sm mb-4">{nextWorkout.focus || 'Geral'}</p>

                            <button
                                onClick={() => navigate(`/workout/${nextWorkout.id}`)}
                                className="bg-white text-primary-700 font-bold py-3 px-6 rounded-xl w-full flex items-center justify-center gap-2 shadow-xl hover:bg-slate-50 transition-colors"
                            >
                                <Play size={20} fill="currentColor" />
                                Iniciar Treino
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-800 rounded-2xl p-6 text-center border border-slate-700">
                        <p className="text-slate-400 mb-2">Nenhum treino agendado.</p>
                        <p className="text-xs text-slate-500">Aguarde seu treinador enviar um programa.</p>
                    </div>
                )}
            </div>

            {/* Quick Stats / History Preview */}
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg">Essa Semana</h3>
                    <span className="text-slate-500 text-xs">Ver Histórico</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-primary-400 mb-2">
                            <Calendar size={18} />
                            <span className="text-xs font-bold uppercase">Frequência</span>
                        </div>
                        <p className="text-2xl font-bold text-white">0 <span className="text-sm text-slate-500 font-normal">/ 4</span></p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <History size={18} />
                            <span className="text-xs font-bold uppercase">Volume</span>
                        </div>
                        <p className="text-2xl font-bold text-white">0 <span className="text-sm text-slate-500 font-normal">kg</span></p>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around items-center z-50">
                <button className="flex flex-col items-center gap-1 text-primary-500">
                    <Calendar size={24} />
                    <span className="text-[10px] font-medium">Treinos</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-slate-500 hover:text-white transition-colors">
                    <History size={24} />
                    <span className="text-[10px] font-medium">Histórico</span>
                </button>
            </div>
        </div>
    );
};

export default StudentDashboard;
