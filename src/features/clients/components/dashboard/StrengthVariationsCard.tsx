import React from 'react';
import { BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import { StrengthVariation } from '../../hooks/analytics/useProgressionAnalysis';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';

interface StrengthVariationsCardProps {
    variations: StrengthVariation[];
    loading?: boolean;
    onExerciseClick?: (exerciseName: string) => void;
}

export const StrengthVariationsCard: React.FC<StrengthVariationsCardProps> = ({ variations, loading = false, onExerciseClick }) => {

    if (loading) {
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm h-full flex items-center justify-center animate-pulse">
                <div className="h-6 w-32 bg-slate-700 rounded mb-4"></div>
            </div>
        );
    }

    const hasData = variations && variations.length > 0;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-0 shadow-sm relative flex flex-col h-full min-h-[220px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50 backdrop-blur-sm z-10 rounded-t-xl">
                <div className="flex items-center gap-2">
                    <BarChart3 size={16} className="text-indigo-400" />
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase leading-none flex items-center gap-1">
                            Variações de Força
                            <InfoTooltip text="Exercícios com as maiores mudanças de e1RM em relação ao início do mesociclo atual. Verde = ganho, Vermelho = queda." />
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                            vs. início do mesociclo
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-center">
                {hasData ? (
                    <div className="space-y-4">
                        {variations.map((variation, idx) => {
                            const isGain = variation.direction === 'up';
                            const colorClass = isGain ? 'text-emerald-400' : 'text-rose-400';

                            return (
                                <button
                                    key={`${variation.name}-${idx}`}
                                    className="flex items-center justify-between group w-full text-left hover:bg-slate-700/30 p-2 rounded-lg -mx-2 transition-all cursor-pointer"
                                    onClick={() => onExerciseClick?.(variation.name)}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        {/* Position Badge */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ring-1 bg-slate-700/50 ring-slate-600/30 group-hover:ring-slate-500/50 transition-all`}>
                                            <span className="text-sm font-bold text-slate-400 group-hover:text-slate-300">{idx + 1}º</span>
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors truncate max-w-[120px] sm:max-w-[140px]" title={variation.name}>
                                                {variation.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase font-medium">{variation.muscleGroup}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end flex-shrink-0 ml-2">
                                        <div className="flex items-center gap-1">
                                            {isGain ? (
                                                <ArrowUp size={12} className={colorClass} />
                                            ) : (
                                                <ArrowDown size={12} className={colorClass} />
                                            )}
                                            <span className={`font-semibold text-xs ${colorClass}`}>
                                                {isGain ? '+' : ''}{variation.changePercentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 mt-0.5">
                                            {Math.round(variation.baselineE1RM)} <span className="text-slate-600">→</span> <span className="text-slate-300 font-semibold">{Math.round(variation.currentE1RM)}kg</span>
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center h-full text-slate-500">
                        <div className="bg-slate-700/30 p-3 rounded-full mb-2">
                            <BarChart3 size={20} className="text-slate-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-400">Dados insuficientes</p>
                        <p className="text-xs text-slate-600 mt-1 max-w-[180px]">Execute mais sessões dentro do mesociclo para comparar.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
