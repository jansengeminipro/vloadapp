import React from 'react';
import { CalendarDays, Activity, Layers, Zap, BarChart3, CheckCircle as CheckCircleIcon, ArrowDownRight, Minus } from 'lucide-react';
import { Client } from '@/shared/types';
import BodyHeatmap from './BodyHeatmap';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, Cell } from 'recharts';
import { MUSCLE_COLORS } from '../constants';

interface ClientStatsProps {
    activeProgram: Client['activeProgram'];
    dashboardStats: any; // Ideally define a proper type for this
    progDistributionMetric: 'sets' | 'load';
    setProgDistributionMetric: (metric: 'sets' | 'load') => void;
}

const StatusBadge = ({ current, target }: { current: number, target: number }) => {
    const ratio = target > 0 ? current / target : 1;
    if (ratio >= 1) return <span className="text-[10px] bg-[#6366f1]/10 text-[#6366f1] px-2 py-0.5 rounded font-bold border border-[#6366f1]/20 flex items-center gap-1"><CheckCircleIcon size={10} /> NA META</span>;
    if (ratio >= 0.8) return <span className="text-[10px] bg-[#a855f7]/10 text-[#a855f7] px-2 py-0.5 rounded font-bold border border-[#a855f7]/20 flex items-center gap-1"><Minus size={10} /> QUASE LÁ</span>;
    return <span className="text-[10px] bg-[#22d3ee]/10 text-[#22d3ee] px-2 py-0.5 rounded font-bold border border-[#22d3ee]/20 flex items-center gap-1"><ArrowDownRight size={10} /> ABAIXO</span>;
};

const ClientStats: React.FC<ClientStatsProps> = ({
    activeProgram,
    dashboardStats,
    progDistributionMetric,
    setProgDistributionMetric
}) => {
    if (!activeProgram || !dashboardStats) return null;

    return (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><CalendarDays size={48} className="text-white" /></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Treinos na Semana</h4>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{dashboardStats.weekSessionsCount}</span>
                        <span className="text-sm text-slate-500 mb-1">/ {dashboardStats.plannedWeeklySessions} Planejados</span>
                    </div>
                    <StatusBadge current={dashboardStats.weekSessionsCount} target={dashboardStats.plannedWeeklySessions} />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={48} className="text-white" /></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Treinos no Mesociclo</h4>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{dashboardStats.mesocycleSessionsCount}</span>
                        <span className="text-sm text-slate-500 mb-1">/ {dashboardStats.plannedMesocycleSessions} Planejados</span>
                    </div>
                    <StatusBadge current={dashboardStats.mesocycleSessionsCount} target={dashboardStats.plannedMesocycleSessions} />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Layers size={48} className="text-white" /></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Volume Semanal (Séries)</h4>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{dashboardStats.currentWeeklySets}</span>
                        <span className="text-sm text-slate-500 mb-1">/ {dashboardStats.plannedWeeklySets} Planejados</span>
                    </div>
                    <StatusBadge current={dashboardStats.currentWeeklySets} target={dashboardStats.plannedWeeklySets} />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col items-center">
                    <h4 className="text-sm font-bold text-white uppercase mb-4 w-full flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Mapa de Calor Muscular</h4>
                    <BodyHeatmap muscleVolumes={dashboardStats.weeklyMuscleVolume} />
                </div>
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2"><BarChart3 size={16} className="text-primary-500" /> Distribuição de Volume (Semana Atual)</h4>
                        <div className="flex bg-slate-900 rounded-lg border border-slate-700 p-1">
                            <button
                                onClick={() => setProgDistributionMetric('sets')}
                                className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${progDistributionMetric === 'sets' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Séries
                            </button>
                            <button
                                onClick={() => setProgDistributionMetric('load')}
                                className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${progDistributionMetric === 'load' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Carga
                            </button>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dashboardStats.muscleDistributionData} layout="vertical" margin={{ top: 0, left: 30, right: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
                                <RechartsTooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl min-w-[120px] z-50">
                                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">{label}</p>
                                                    <div className="flex items-center justify-between gap-3 text-[10px] leading-tight">
                                                        <span className="text-white font-bold">{payload[0].value} {progDistributionMetric === 'sets' ? 'Séries' : 'kg'}</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {dashboardStats.muscleDistributionData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={MUSCLE_COLORS[entry.name] || '#64748b'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientStats;
