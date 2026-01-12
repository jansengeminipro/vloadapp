import React from 'react';
import {
    CalendarDays, Activity, Layers, Zap, Scale, Ruler, ArrowRight,
    BarChart3, TrendingUp, HeartPulse
} from 'lucide-react';
import { Client, SavedSession } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';
import BodyHeatmap from '../components/BodyHeatmap';
import { StatusBadge } from '@/shared/components/analytics/StatusBadge';
import { TrendIndicator } from '@/shared/components/analytics/TrendIndicator';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';
import { VolumeDistributionChart } from '../components/charts/VolumeDistributionChart';
import { useClientDashboardData } from '../hooks/useClientDashboardData';

interface ClientDashboardProps {
    activeProgram: Client['activeProgram'];
    dashboardStats: any;
    latestAssessment?: Assessment;
    completedSessions: SavedSession[];
    progDistributionMetric: 'sets' | 'load';
    setProgDistributionMetric: (metric: 'sets' | 'load') => void;
}

const ClientDashboardInner: React.FC<ClientDashboardProps> = ({
    activeProgram,
    dashboardStats,
    latestAssessment,
    completedSessions,
    progDistributionMetric,
    setProgDistributionMetric
}) => {
    // 1. Calculate Analytics Metrics (ACWR, Internal Load)
    const analyticsMetrics = useClientDashboardData(completedSessions);

    if (!activeProgram || !dashboardStats) return null;

    const getAssessmentValue = (key: string, suffix: string = '') => {
        if (!latestAssessment?.data) return '-';
        const data = latestAssessment.data;
        const result = data._result;

        if (key === 'weight') {
            const val = data.weight_kg || data.weight;
            return val ? `${val}${suffix}` : '-';
        }

        if (key === 'bodyFat') {
            // For Pollock, Guedes, etc., score is %BF
            if (['pollock3', 'pollock7', 'faulkner', 'guedes', 'bia'].includes(latestAssessment.type)) {
                return result?.score !== undefined ? `${result.score}${suffix}` : '-';
            }
            return '-';
        }

        const val = data[key] || (result?.metrics && result.metrics[key]);
        return val ? `${val}${suffix}` : '-';
    };

    return (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-6 pb-12">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><CalendarDays size={48} className="text-white" /></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Treinos na Semana</h4>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{dashboardStats.weekSessionsCount}</span>
                        <span className="text-sm text-slate-500 mb-1">/ {dashboardStats.plannedWeeklySessions} Planejados</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge current={dashboardStats.weekSessionsCount} target={dashboardStats.plannedWeeklySessions} />
                        {analyticsMetrics && (
                            <TrendIndicator current={dashboardStats.weekSessionsCount} previous={analyticsMetrics.prevSessionsCount} type="points" />
                        )}
                    </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Layers size={48} className="text-white" /></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Volume Semanal (Séries)</h4>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-3xl font-bold text-white">{dashboardStats.currentWeeklySets}</span>
                        <span className="text-sm text-slate-500 mb-1">/ {dashboardStats.plannedWeeklySets} Meta</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge current={dashboardStats.currentWeeklySets} target={dashboardStats.plannedWeeklySets} />
                        {analyticsMetrics && (
                            <TrendIndicator current={dashboardStats.currentWeeklySets} previous={analyticsMetrics.prevSetsCount} type="percent" />
                        )}
                    </div>
                </div>

                {/* ACWR Metric */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity overflow-hidden pointer-events-none"><TrendingUp size={48} className="text-white" /></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center">
                        Status de Carga (ACWR)
                        <InfoTooltip text="Mede o risco de lesão comparando o esforço da última semana com o que você aguentou no último mês. Ideal entre 0.8 e 1.3." />
                    </h4>
                    {analyticsMetrics ? (
                        <>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-3xl font-bold text-white">{analyticsMetrics.latest.acwr.toFixed(2)}</span>
                                <span className="text-sm text-slate-500 mb-1">Ratio</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold border flex items-center gap-1 w-fit"
                                style={{ backgroundColor: `${analyticsMetrics.status.color}15`, color: analyticsMetrics.status.color, borderColor: `${analyticsMetrics.status.color}30` }}>
                                <HeartPulse size={10} /> {analyticsMetrics.status.label.toUpperCase()}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs text-slate-500 italic">Calculando métricas...</span>
                    )}
                </div>

                {/* Latest Anthropometry */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Scale size={48} className="text-white" /></div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Peso & Composição</h4>
                    {latestAssessment ? (
                        <div>
                            <div className="flex items-end gap-2 mb-1">
                                <span className="text-3xl font-bold text-white">{getAssessmentValue('weight', 'kg')}</span>
                                <span className="text-sm text-slate-500 mb-1">Atual</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>BF: <span className="text-white font-bold">{getAssessmentValue('bodyFat', '%')}</span></span>
                                <span className="text-slate-600">•</span>
                                <span>{new Date(latestAssessment.date).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full justify-center">
                            <span className="text-sm text-slate-500 italic">Nenhuma avaliação</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Middle Section: Distribution vs Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Volume Distribution Bar Chart */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary-500" /> Distribuição de Volume (Semana)
                        </h4>
                        <div className="flex bg-slate-900 rounded-lg border border-slate-700 p-1">
                            {(['sets', 'load'] as const).map(m => (
                                <button
                                    key={m}
                                    onClick={() => setProgDistributionMetric(m)}
                                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-colors ${progDistributionMetric === m ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {m === 'sets' ? 'Séries' : 'Carga'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <VolumeDistributionChart data={dashboardStats.muscleDistributionData} metric={progDistributionMetric} />
                </div>

                {/* Heatmap Section */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col items-center relative">
                    <h4 className="text-sm font-bold text-white uppercase mb-4 w-full flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" /> Mapa de Calor Semanal
                    </h4>
                    <div className="scale-90 lg:scale-100">
                        <BodyHeatmap muscleVolumes={dashboardStats.weeklyMuscleVolume} />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Internal Load & Program Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Internal Load Zone Dashboard */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm">
                    <h4 className="text-sm font-bold text-white uppercase mb-4 w-full flex items-center gap-2">
                        <Activity size={16} className="text-cyan-400" /> Carga de Trabalho Recente
                        <InfoTooltip text="Mede o estresse psicológico e fisiológico total baseado no volume e intensidade das sessões." />
                    </h4>
                    {analyticsMetrics ? (
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Carga Interna (Acumulada 7d)</span>
                                        <TrendIndicator current={analyticsMetrics.weeklyLoadSum} previous={analyticsMetrics.weeklyLoadSumPrev} type="percent" />
                                    </div>
                                    <span className="text-xl font-bold text-white ml-2">{analyticsMetrics.weeklyLoadSum} <span className="text-xs text-slate-500 font-normal">UA</span></span>
                                </div>
                                <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: analyticsMetrics.loadZone.color }}></div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{analyticsMetrics.loadZone.label}</p>
                                            <p className="text-[10px] text-slate-500 leading-tight">Baseado no volume e percepção de esforço das últimas sessões.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 relative group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center">
                                            Carga Aguda (7d)
                                            <InfoTooltip text="Média de estresse acumulado nos últimos 7 dias. Indica o seu estado de fadiga atual." />
                                        </span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white tracking-tight">{analyticsMetrics.latest.acuteLoad} UA</span>
                                            <TrendIndicator current={analyticsMetrics.latest.acuteLoad} previous={analyticsMetrics.acutePrev} type="percent" />
                                        </div>
                                    </div>
                                    {/* Visual Progress Bar */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-slate-700 w-full rounded-b-lg overflow-hidden">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, (analyticsMetrics.latest.acuteLoad / 200) * 100)}%`,
                                                backgroundColor: analyticsMetrics.loadZone.color
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 relative group">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center">
                                            Carga Crônica (28d)
                                            <InfoTooltip text="Capacidade de carga construída nos últimos 28 dias. Indica o seu nível de condicionamento." />
                                        </span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-white tracking-tight">{analyticsMetrics.latest.chronicLoad} UA</span>
                                            <TrendIndicator current={analyticsMetrics.latest.chronicLoad} previous={analyticsMetrics.chronicPrev} type="percent" />
                                        </div>
                                    </div>
                                    {/* Visual Progress Bar (Compared to Acute to show trend) */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-slate-700 w-full rounded-b-lg overflow-hidden">
                                        <div
                                            className="h-full bg-[#6366f1]/50 transition-all duration-500"
                                            style={{
                                                width: `${Math.min(100, (analyticsMetrics.latest.chronicLoad / (analyticsMetrics.latest.acuteLoad || 100)) * 100)}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-40 text-slate-500 italic text-xs">
                            Sem dados de treino suficientes
                        </div>
                    )}
                </div>

                {/* Program Summary */}
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase flex items-center gap-2 mb-6">
                            <Ruler size={16} className="text-primary-500" /> Resumo do Planejamento
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Nome do Programa</span>
                                <span className="text-sm font-bold text-white block truncate" title={activeProgram.name}>{activeProgram.name}</span>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Início</span>
                                <span className="text-sm font-bold text-white block">{new Date(activeProgram.startDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Término Previsto</span>
                                <span className="text-sm font-bold text-white block">
                                    {activeProgram.endDate ? new Date(activeProgram.endDate).toLocaleDateString('pt-BR') : 'Indeterminado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/30 rounded-xl p-4 border border-dashed border-slate-700 flex items-center justify-between gap-4">
                        <div>
                            <h5 className="text-white font-bold text-sm mb-1">Deseja revisar o cronograma?</h5>
                            <p className="text-xs text-slate-400">Acesse a aba 'Programa' para gerenciar dias e exercícios.</p>
                        </div>
                        <div className="bg-slate-800 p-2 rounded-lg text-slate-500 group-hover:text-primary-400 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ClientDashboard = React.memo(ClientDashboardInner);

export default ClientDashboard;
