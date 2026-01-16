import React from 'react';
import { TrendingUp, Award, Dumbbell } from 'lucide-react';
import { TopExercise } from '../../hooks/analytics/useProgressionAnalysis';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';

interface TopProgressionCardProps {
    topExercises: TopExercise[];
    loading?: boolean;
}

export const TopProgressionCard: React.FC<TopProgressionCardProps> = ({ topExercises, loading = false }) => {

    if (loading) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm h-full flex items-center justify-center animate-pulse">
                <div className="h-6 w-32 bg-slate-700 rounded mb-4"></div>
            </div>
        );
    }

    const hasData = topExercises && topExercises.length > 0;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-0 shadow-sm relative flex flex-col h-full min-h-[220px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase leading-none flex items-center gap-1">
                            Top Progressão
                            <InfoTooltip text="Exercícios com maior aumento de carga estimada (1RM) em relação à sua melhor marca histórica." />
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                            Destaques da Semana
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-center">
                {hasData ? (
                    <div className="space-y-4">
                        {topExercises.map((ex, idx) => {
                            // Medal colors based on position
                            const medalColors = [
                                { bg: 'bg-amber-500/20', text: 'text-amber-400', ring: 'ring-amber-500/30' },   // Gold
                                { bg: 'bg-slate-400/20', text: 'text-slate-300', ring: 'ring-slate-400/30' },   // Silver
                                { bg: 'bg-orange-600/20', text: 'text-orange-400', ring: 'ring-orange-500/30' } // Bronze
                            ];
                            const medal = medalColors[idx] || medalColors[2];

                            return (
                                <div key={`${ex.name}-${idx}`} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        {/* Medal Icon */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-1 ${medal.bg} ${medal.ring}`}>
                                            <span className={`text-sm font-bold ${medal.text}`}>{idx + 1}º</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate max-w-[130px] sm:max-w-[150px]" title={ex.name}>
                                                {ex.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase font-medium">{ex.muscleGroup}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-emerald-400 font-semibold text-xs">
                                            +{ex.increasePercentage.toFixed(1)}%
                                        </span>
                                        <span className="text-[10px] text-slate-500 mt-0.5">
                                            {Math.round(ex.previousBest)}kg <span className="text-slate-600">→</span> <span className="text-slate-300 font-semibold">{Math.round(ex.currentE1RM)}kg</span>
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
                        <div className="bg-slate-700/30 p-3 rounded-full mb-2">
                            <TrendingUp size={20} className="text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">Sem recordes esta semana</p>
                        <p className="text-xs text-slate-600 mt-1 max-w-[180px]">Continue treinando para superar suas marcas anteriores.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
