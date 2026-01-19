import React, { useMemo } from 'react';
import { X, TrendingUp, Calendar, Dumbbell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SavedSession } from '@/shared/types';

interface ExerciseEvolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    exerciseName: string;
    sessions: SavedSession[];
}

export const ExerciseEvolutionModal: React.FC<ExerciseEvolutionModalProps> = ({
    isOpen,
    onClose,
    exerciseName,
    sessions
}) => {
    if (!isOpen || !exerciseName) return null;

    // Process sessions to get history for this exercise
    const chartData = useMemo(() => {
        const data: { date: string, originalDate: number, e1rm: number }[] = [];

        sessions.forEach(session => {
            if (!session.details || !Array.isArray(session.details)) return;

            session.details.forEach((exercise: any) => {
                if (exercise.name === exerciseName && exercise.setDetails && Array.isArray(exercise.setDetails)) {
                    // Calculate best e1RM for this session
                    const bestE1RM = exercise.setDetails.reduce((max: number, set: any) => {
                        const weight = parseFloat(set.weight) || 0;
                        const reps = parseFloat(set.reps) || 0;
                        const e1rm = weight * (1 + 0.0333 * reps);
                        return Math.max(max, e1rm);
                    }, 0);

                    if (bestE1RM > 0) {
                        data.push({
                            date: new Date(session.date).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' }),
                            originalDate: new Date(session.date).getTime(),
                            e1rm: Math.round(bestE1RM)
                        });
                    }
                }
            });
        });

        // Sort chronological
        return data.sort((a, b) => a.originalDate - b.originalDate);
    }, [sessions, exerciseName]);

    const currentVal = chartData.length > 0 ? chartData[chartData.length - 1].e1rm : 0;
    const initialVal = chartData.length > 0 ? chartData[0].e1rm : 0;
    const evolution = initialVal > 0 ? ((currentVal - initialVal) / initialVal) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div>
                        <div className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
                            <Dumbbell size={12} />
                            Histórico de Carga
                        </div>
                        <h3 className="text-lg font-bold text-white leading-tight">{exerciseName}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Stats Header */}
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <div className="text-sm text-slate-400 mb-1">Carga Estimada Atual (1RM)</div>
                            <div className="text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
                                {currentVal} <span className="text-lg text-slate-500 font-medium">kg</span>
                            </div>
                        </div>

                        {chartData.length > 1 && (
                            <div className={`text-right ${evolution >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <div className="text-xs font-bold uppercase mb-1">Evolução total</div>
                                <div className="text-xl font-black flex items-center justify-end gap-1">
                                    {evolution > 0 ? '+' : ''}{evolution.toFixed(1)}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chart */}
                    <div className="h-64 w-full bg-slate-950/30 rounded-xl border border-slate-800/50 p-2 relative">
                        {chartData.length > 1 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#64748b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#64748b"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                        formatter={(value: any) => [`${value} kg`, '1RM Est.']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="e1rm"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ fill: '#0f172a', stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#6366f1' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-500 flex-col gap-2">
                                <Calendar size={24} className="text-slate-600" />
                                <span className="text-xs">Dados insuficientes para gráfico</span>
                            </div>
                        )}

                    </div>

                    {/* Footer Info */}
                    <div className="mt-6 flex items-start gap-2 text-xs text-slate-500 leading-relaxed bg-slate-800/30 p-3 rounded-lg">
                        <TrendingUp size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                        <p>
                            O gráfico mostra a evolução da sua <b>Força Máxima Estimada (1RM)</b>.
                            Calculada com base na melhor série (peso x reps) de cada treino realizado.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
