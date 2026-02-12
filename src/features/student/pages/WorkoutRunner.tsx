import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/shared/lib/supabase';
import { WorkoutTemplate, WorkoutExercise } from '@/shared/types';
import { ChevronLeft, Clock, CheckCircle, Save, Play, Pause, RotateCcw } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

const WorkoutRunner: React.FC = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [template, setTemplate] = useState<WorkoutTemplate | null>(null);
    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
    const [startedAt] = useState(new Date());

    // Session State
    const [sessionData, setSessionData] = useState<any[]>([]); // To store sets data
    const [completedSets, setCompletedSets] = useState<Set<string>>(new Set()); // key: exIndex-setIndex

    // Timer
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchTemplate = async () => {
            if (!templateId) return;
            const { data } = await supabase
                .from('workout_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (data) {
                const mapped: WorkoutTemplate = {
                    id: data.id,
                    name: data.name,
                    focus: data.focus,
                    lastModified: data.last_modified,
                    exercises: data.exercises_json
                };
                setTemplate(mapped);

                // Initialize session data structure
                const initData = mapped.exercises.map(ex => ({
                    exerciseId: ex.id,
                    name: ex.name,
                    sets: Array(ex.sets).fill({ weight: 0, reps: 0, rpe: 0, completed: false })
                }));
                setSessionData(initData);
            }
            setLoading(false);
        };
        fetchTemplate();
    }, [templateId]);

    const toggleSetComplete = (exIndex: number, setIndex: number) => {
        const key = `${exIndex}-${setIndex}`;
        const newCompleted = new Set(completedSets);
        if (newCompleted.has(key)) {
            newCompleted.delete(key);
        } else {
            newCompleted.add(key);
        }
        setCompletedSets(newCompleted);

        // Auto-advance if all sets done? Maybe not.
    };

    const updateSetData = (exIndex: number, setIndex: number, field: string, value: any) => {
        const newData = [...sessionData];
        newData[exIndex].sets[setIndex] = { ...newData[exIndex].sets[setIndex], [field]: value };
        setSessionData(newData);
    };

    const finishWorkout = async () => {
        if (!confirm('Finalizar treino?')) return;

        try {
            // Calculate Volume Load
            let volumeLoad = 0;
            let totalSets = 0;
            sessionData.forEach((ex, i) => {
                ex.sets.forEach((set: any, j: number) => {
                    if (completedSets.has(`${i}-${j}`)) {
                        volumeLoad += (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0);
                        totalSets++;
                    }
                });
            });

            const payload = {
                user_id: user?.id,
                template_id: template?.id,
                template_name: template?.name,
                date: new Date().toISOString(),
                duration_seconds: timer,
                volume_load: volumeLoad,
                total_sets: totalSets,
                rpe: 8, // Global RPE default, maybe ask user
                details_json: sessionData
                // rir?
            };

            const { error } = await supabase.from('workout_sessions').insert(payload);
            if (error) throw error;

            alert('Treino salvo com sucesso!');
            navigate('/');
        } catch (err: any) {
            alert('Erro ao salvar: ' + err.message);
        }
    };

    if (loading) return <div className="p-8 text-white">Carregando treino...</div>;
    if (!template) return <div className="p-8 text-white">Treino não encontrado.</div>;

    const activeExercise = template.exercises[activeExerciseIndex];

    return (
        <div className="min-h-screen bg-surface-950 pb-20 flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-surface-900 p-4 border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="p-2 text-surface-400 hover:text-white hover:bg-surface-800 rounded-full transition-colors"><ChevronLeft /></button>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-surface-500 font-bold uppercase tracking-wider font-display">Em Andamento</span>
                    <h1 className="text-white font-bold font-display">{template.name}</h1>
                </div>
                <div className="flex items-center gap-2 bg-surface-800 px-3 py-1 rounded-full border border-white/5 shadow-inner">
                    <Clock size={14} className="text-primary-400" />
                    <span className="text-white font-mono text-sm font-bold">{formatTime(timer)}</span>
                </div>
            </div>

            {/* Exercise Scroller */}
            <div className="bg-surface-900/50 backdrop-blur-sm p-4 border-b border-white/5 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                    {template.exercises.map((ex, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveExerciseIndex(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeExerciseIndex === idx
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20 scale-105'
                                : 'bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white'
                                }`}
                        >
                            {idx + 1}. {ex.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Active Exercise Card */}
                <div className="bg-surface-800 border border-white/5 rounded-xl overflow-hidden shadow-xl">
                    {activeExercise.videoUrl && (
                        <div className="aspect-video bg-black relative">
                            {/* Simple video placeholder or iframe */}
                            <iframe
                                src={`https://www.youtube.com/embed/${activeExercise.videoUrl.split('v=')[1]}?controls=0`}
                                className="w-full h-full opacity-60 pointer-events-none"
                                title="Exercise Video"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-surface-900 to-transparent"></div>
                        </div>
                    )}

                    <div className="p-6 relative">
                        {!activeExercise.videoUrl && <div className="absolute top-0 left-0 w-full h-1 bg-primary-500"></div>}
                        <h2 className="text-2xl font-bold text-white mb-1 font-display">{activeExercise.name}</h2>
                        <div className="flex gap-4 text-sm text-surface-400 mb-6 font-medium">
                            <span className="bg-surface-900 px-2 py-1 rounded border border-white/5">{activeExercise.muscleGroup}</span>
                            <span className="bg-surface-900 px-2 py-1 rounded border border-white/5">Descanso: {activeExercise.restSeconds}s</span>
                        </div>

                        {/* Sets Table */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-10 gap-2 text-xs text-surface-500 font-bold uppercase text-center mb-2 px-2 tracking-wider">
                                <div className="col-span-1">#</div>
                                <div className="col-span-3">kg</div>
                                <div className="col-span-3">Reps</div>
                                <div className="col-span-3">Check</div>
                            </div>

                            {Array.from({ length: activeExercise.sets }).map((_, setIdx) => {
                                const isCompleted = completedSets.has(`${activeExerciseIndex}-${setIdx}`);
                                return (
                                    <div key={setIdx} className={`grid grid-cols-10 gap-2 items-center p-2 rounded-lg border transition-all ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-surface-900 border-white/5'
                                        }`}>
                                        <div className="col-span-1 text-center font-bold text-surface-400">{setIdx + 1}</div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full bg-surface-950 border border-white/5 rounded p-2 text-center text-white font-bold focus:border-primary-500 outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-surface-700"
                                                onChange={(e) => updateSetData(activeExerciseIndex, setIdx, 'weight', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="number"
                                                placeholder={activeExercise.targetReps.toString()}
                                                className="w-full bg-surface-950 border border-white/5 rounded p-2 text-center text-white font-bold focus:border-primary-500 outline-none focus:ring-1 focus:ring-primary-500/50 transition-all placeholder-surface-700"
                                                onChange={(e) => updateSetData(activeExerciseIndex, setIdx, 'reps', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-3 flex justify-center">
                                            <button
                                                onClick={() => toggleSetComplete(activeExerciseIndex, setIdx)}
                                                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105' : 'bg-surface-800 text-surface-500 hover:bg-surface-700 hover:text-white'
                                                    }`}
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                    <button
                        disabled={activeExerciseIndex === 0}
                        onClick={() => setActiveExerciseIndex(prev => prev - 1)}
                        className="flex-1 py-4 rounded-xl bg-surface-800 text-surface-400 disabled:opacity-50 font-bold hover:bg-surface-700 hover:text-white transition-colors border border-white/5"
                    >
                        Anterior
                    </button>
                    {activeExerciseIndex < template.exercises.length - 1 ? (
                        <button
                            onClick={() => setActiveExerciseIndex(prev => prev + 1)}
                            className="flex-1 py-4 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all active:scale-[0.98]"
                        >
                            Próximo
                        </button>
                    ) : (
                        <button
                            onClick={finishWorkout}
                            className="flex-1 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                        >
                            <Save size={20} /> Finalizar
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default WorkoutRunner;
