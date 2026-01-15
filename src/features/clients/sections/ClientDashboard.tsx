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
import { DashboardStatsCards } from '../components/dashboard/DashboardStatsCards';
import { LatestAssessmentCarousel } from '../components/dashboard/LatestAssessmentCarousel'; // Keep just in case, but we use Radar
import { PerformanceRadarChart } from '../components/dashboard/PerformanceRadarChart';
import { usePerformanceScore } from '../hooks/analytics/usePerformanceScore';

interface ClientDashboardProps {
    activeProgram: Client['activeProgram'];
    dashboardStats: any;
    latestAssessment?: Assessment;
    completedSessions: SavedSession[];
    progDistributionMetric: 'sets' | 'load';
    setProgDistributionMetric: (metric: 'sets' | 'load') => void;
    client: Client;
}

const ClientDashboardInner: React.FC<ClientDashboardProps> = ({
    activeProgram,
    dashboardStats,
    latestAssessment,
    completedSessions,
    progDistributionMetric,
    setProgDistributionMetric,
    client
}) => {
    // 1. Calculate Analytics Metrics (ACWR, Internal Load)
    const analyticsMetrics = useClientDashboardData(completedSessions);

    // 2. Calculate Performance Scores (0-100)
    const performanceScores = usePerformanceScore({
        dashboardStats,
        analyticsMetrics,
        latestAssessment,
        client
    });

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
            {/* Top Stats Grid - Premium Cards */}
            <DashboardStatsCards
                dashboardStats={dashboardStats}
                analyticsMetrics={analyticsMetrics}
                latestAssessment={latestAssessment}
            />

            {/* Middle Section: Heatmap vs Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Heatmap Section */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm flex flex-col items-center relative">
                    <h4 className="text-sm font-bold text-white uppercase mb-4 w-full flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" /> Mapa de Calor Semanal
                    </h4>
                    <div className="scale-90 lg:scale-100">
                        <BodyHeatmap muscleVolumes={dashboardStats.weeklyMuscleVolume} />
                    </div>
                </div>

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

                {/* Performance Radar (Holistic View) */}
                <div className="lg:col-span-2 h-full">
                    <PerformanceRadarChart data={performanceScores} />
                </div>
            </div>
        </div>
    );
};

export const ClientDashboard = React.memo(ClientDashboardInner);

export default ClientDashboard;
