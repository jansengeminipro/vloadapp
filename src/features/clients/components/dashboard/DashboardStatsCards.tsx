import React from 'react';
import { CalendarDays, Layers, TrendingUp, Scale, HeartPulse } from 'lucide-react';
import { CircularProgress } from '@/shared/components/ui/CircularProgress';
import { Assessment } from '@/features/assessments/domain/models';

interface DashboardStatsCardsProps {
    dashboardStats: {
        weekSessionsCount: number;
        plannedWeeklySessions: number;
        currentWeeklySets: number;
        plannedWeeklySets: number;
    };
    analyticsMetrics?: {
        latest: {
            acwr: number;
        };
        status: {
            label: string;
            color: string;
        };
    } | null;
    latestAssessment?: Assessment;
}

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
    dashboardStats,
    analyticsMetrics,
    latestAssessment
}) => {
    const getAssessmentValue = (key: string, suffix: string = '') => {
        if (!latestAssessment?.data) return '-';
        const data = latestAssessment.data;
        const result = data._result;

        if (key === 'weight') {
            const val = data.weight_kg || data.weight;
            return val ? `${val}${suffix}` : '-';
        }

        if (key === 'bodyFat') {
            if (['pollock3', 'pollock7', 'faulkner', 'guedes', 'bia'].includes(latestAssessment.type)) {
                return result?.score !== undefined ? `${result.score}${suffix}` : '-';
            }
            return '-';
        }

        const val = data[key] || (result?.metrics && result.metrics[key]);
        return val ? `${val}${suffix}` : '-';
    };

    const cards = [
        {
            icon: CalendarDays,
            iconColor: '#F97316',
            label: 'Treinos na Semana',
            value: dashboardStats.weekSessionsCount,
            max: dashboardStats.plannedWeeklySessions,
            suffix: '',
            secondary: `/ ${dashboardStats.plannedWeeklySessions} planejados`,
            color: '#F97316'
        },
        {
            icon: Layers,
            iconColor: '#22C55E',
            label: 'Volume Semanal',
            value: dashboardStats.currentWeeklySets,
            max: dashboardStats.plannedWeeklySets,
            suffix: '',
            secondary: `/ ${dashboardStats.plannedWeeklySets} meta`,
            color: '#22C55E'
        },
        {
            icon: TrendingUp,
            iconColor: analyticsMetrics?.status?.color || '#6366F1',
            label: 'Status ACWR',
            value: analyticsMetrics?.latest?.acwr ?? 0,
            max: 2, // ACWR scale (0-2 for display)
            suffix: '',
            secondary: analyticsMetrics?.status?.label || 'Calculando...',
            color: analyticsMetrics?.status?.color || '#6366F1',
            isDecimal: true
        },
        {
            icon: Scale,
            iconColor: '#6366F1',
            label: 'Peso & Composição',
            value: latestAssessment?.data?.weight_kg || latestAssessment?.data?.weight || 0,
            max: 150, // Max weight for ring display
            suffix: 'kg',
            secondary: `BF: ${getAssessmentValue('bodyFat', '%')}`,
            color: '#6366F1',
            isWeight: true
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-3 md:gap-4">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-5 relative overflow-hidden group hover:border-slate-700 transition-all duration-300"
                >
                    {/* Icon + Label Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <card.icon size={16} style={{ color: card.iconColor }} />
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wide">
                            {card.label}
                        </span>
                    </div>

                    {/* Circular Progress + Value */}
                    <div className="flex flex-col items-center justify-center">
                        <CircularProgress
                            value={card.value}
                            max={card.max}
                            size={80}
                            strokeWidth={6}
                            color={card.color}
                            trackColor="#1E293B"
                            animated={true}
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-xl md:text-2xl font-black text-white leading-none">
                                    {card.isDecimal
                                        ? (card.value as number).toFixed(2)
                                        : card.isWeight
                                            ? (card.value || '-')
                                            : card.value}
                                </span>
                                {card.suffix && (
                                    <span className="text-[9px] text-slate-500 font-medium">
                                        {card.suffix}
                                    </span>
                                )}
                            </div>
                        </CircularProgress>

                        {/* Secondary Info */}
                        <div className="mt-3 text-center">
                            {card.label === 'Status ACWR' ? (
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 justify-center"
                                    style={{
                                        backgroundColor: `${card.color}15`,
                                        color: card.color,
                                        borderColor: `${card.color}30`
                                    }}
                                >
                                    <HeartPulse size={10} />
                                    {card.secondary.toUpperCase()}
                                </span>
                            ) : (
                                <span className="text-[10px] md:text-xs text-slate-500 font-medium">
                                    {card.secondary}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Background Glow Effect */}
                    <div
                        className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none blur-2xl"
                        style={{ backgroundColor: card.color }}
                    />
                </div>
            ))}
        </div>
    );
};

export default DashboardStatsCards;
