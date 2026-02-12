import React, { useState, useMemo } from 'react';
import { TrendingUp, Battery, HeartPulse, Dumbbell } from 'lucide-react';
import { MuscleFilterDropdown } from '../../components/ui/analytics/MuscleFilterDropdown';
import { ProgressionExerciseFilter } from '../../components/ui/analytics/ProgressionExerciseFilter';
import { VolumeEvolutionChart } from '../../components/charts/VolumeEvolutionChart';
import { ProgressionChart } from '../../components/charts/ProgressionChart';
import { FatigueChart } from '../../components/charts/FatigueChart';
import { ACWRChart } from '../../components/charts/ACWRChart';

import { useVolumeAnalysis } from '../../hooks/analytics/useVolumeAnalysis';
import { useProgressionStats } from '../../hooks/analytics/useProgressionStats';
import { useClientMetrics } from '../../hooks/analytics/useClientMetrics';
import { SavedSession, MuscleGroup } from '@/shared/types';
import { MUSCLE_COLORS, CHART_COLORS } from '../../constants';

import { TimeRange } from '../../hooks/analytics/useVolumeAnalysis';

interface ClientAnalyticsProps {
    sessions: SavedSession[];
}

const ClientAnalyticsInner: React.FC<ClientAnalyticsProps> = ({ sessions }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('3M');
    const [volumeCalculation, setVolumeCalculation] = useState<'sets' | 'load'>('sets');

    // 1. Volume Analysis Hook
    const {
        volumeChartData,
        activeMuscleGroups,
        visibleMuscleGroups,
        setVisibleMuscleGroups,
        startDate
    } = useVolumeAnalysis(sessions, timeRange, volumeCalculation);

    // 2. Progression Stats Hook
    const {
        progressionChartData,
        selectedProgressionExercises,
        setSelectedProgressionExercises,
        availableExercises,
        toggleProgressionExercise
    } = useProgressionStats(sessions, startDate, timeRange);

    // 3. Client Metrics Hook (Fatigue & ACWR)
    const { advancedAnalyticsData, acwrData } = useClientMetrics(sessions, startDate);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 pb-12">

            {/* 1. Volume Chart */}
            <div className="bg-surface-800 border border-white/5 rounded-xl p-6 backdrop-blur-sm shadow-sm group hover:border-white/10 transition-colors">
                <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-4 mb-6">
                    <div className="text-center xl:text-left">
                        <h3 className="text-lg font-bold text-white flex items-center justify-center xl:justify-start gap-2 font-display tracking-tight">
                            <TrendingUp className="text-primary-500" size={20} /> Volume Semanal
                        </h3>
                        <p className="text-xs text-surface-500 mt-1 font-medium">Agonistas 100%, Sinergistas 50%.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto">
                        <MuscleFilterDropdown
                            activeMuscleGroups={activeMuscleGroups}
                            visibleMuscleGroups={visibleMuscleGroups}
                            setVisibleMuscleGroups={setVisibleMuscleGroups}
                        />
                        <div className="flex bg-surface-900 rounded-lg border border-white/5 p-1">
                            <button onClick={() => setVolumeCalculation('sets')} className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${volumeCalculation === 'sets' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-500 hover:text-surface-300'}`}>Séries</button>
                            <button onClick={() => setVolumeCalculation('load')} className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${volumeCalculation === 'load' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-500 hover:text-surface-300'}`}>Carga</button>
                        </div>
                        <div className="flex bg-surface-900 rounded-lg border border-white/5 p-1">
                            {(['1M', '3M', '6M', 'YTD', 'ALL'] as TimeRange[]).map(r => (
                                <button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 text-xs font-bold rounded uppercase tracking-wider transition-colors ${timeRange === r ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-500 hover:text-surface-300'}`}>{r}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <VolumeEvolutionChart
                    data={volumeChartData}
                    activeMuscleGroups={activeMuscleGroups}
                    visibleMuscleGroups={visibleMuscleGroups}
                />
            </div>

            {/* 2. Progression Chart */}
            <div className="bg-surface-800 border border-white/5 rounded-xl p-6 backdrop-blur-sm shadow-sm hover:border-white/10 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2 font-display tracking-tight">
                            <Dumbbell className="text-amber-500" size={20} /> Progressão de Carga
                        </h3>
                        <p className="text-xs text-surface-500 mt-1 text-center md:text-left font-medium">Evolução de carga máxima.</p>
                    </div>
                    <div className="flex gap-2 justify-center w-full md:w-auto">
                        <ProgressionExerciseFilter
                            availableExercises={availableExercises}
                            selectedExercises={selectedProgressionExercises}
                            setSelectedExercises={setSelectedProgressionExercises}
                        />
                    </div>
                </div>

                <ProgressionChart
                    data={progressionChartData}
                    selectedExercises={selectedProgressionExercises}
                />
            </div>

            {/* 3. Systemic Load */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-surface-800 border border-white/5 rounded-xl p-6 backdrop-blur-sm shadow-sm hover:border-white/10 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2 font-display tracking-tight">
                                <Battery className="text-rose-500" size={20} /> Carga Sistêmica (Fadiga)
                            </h3>
                            <p className="text-xs text-surface-500 mt-1 font-medium">Carga Interna = Total de Séries × (10 - RIR Médio).</p>
                        </div>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider items-center justify-center flex-wrap w-full md:w-auto">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22d3ee' }}></div> Baixa</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6366f1' }}></div> Moderada</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a855f7' }}></div> Alta</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }}></div> Extrema</div>
                        </div>
                    </div>

                    <FatigueChart data={advancedAnalyticsData} />
                </div>

                {/* 4. ACWR */}
                <div className="bg-surface-800 border border-white/5 rounded-xl p-6 backdrop-blur-sm shadow-sm hover:border-white/10 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2 font-display tracking-tight">
                                <HeartPulse className="text-emerald-500" size={20} /> Controle de Carga (ACWR)
                            </h3>
                            <p className="text-xs text-surface-500 mt-1 font-medium">
                                Razão de Carga Aguda (7d) / Crônica (28d). Mantenha-se entre 0.8 e 1.3.
                            </p>
                        </div>
                    </div>

                    <ACWRChart data={acwrData} />
                </div>
            </div>
        </div>
    );
};

export const ClientAnalytics = React.memo(ClientAnalyticsInner);

export default ClientAnalytics;
