import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TrendingUp, Layers, ChevronUp, ChevronDown, Check, Dumbbell, Filter, Battery, AlertCircle, HeartPulse, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, ReferenceLine, ReferenceArea, ComposedChart } from 'recharts';
import { SavedSession, MuscleGroup } from '@/shared/types';
import { MUSCLE_COLORS, CHART_COLORS } from '../constants';
import { calculateACWRMetrics, getACWRStatus, getInternalLoadZone, safeGetMonday, normalizeMuscleForChart } from '@/shared/utils/analytics';
import { getExerciseByName } from '@/shared/data/exercises';

interface ClientAnalyticsProps {
    sessions: SavedSession[];
}

type TimeRange = '1M' | '3M' | '6M' | 'YTD' | 'ALL';

const ClientAnalyticsInner: React.FC<ClientAnalyticsProps> = ({ sessions }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('3M');
    const [volumeCalculation, setVolumeCalculation] = useState<'sets' | 'load'>('sets');

    // Volume Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [muscleSearchTerm, setMuscleSearchTerm] = useState('');
    const [visibleMuscleGroups, setVisibleMuscleGroups] = useState<string[]>([]);
    const [activeMuscleGroups, setActiveMuscleGroups] = useState<string[]>([]);

    // Progression Filter State
    const [isProgressionFilterOpen, setIsProgressionFilterOpen] = useState(false);
    const progressionFilterRef = useRef<HTMLDivElement>(null);
    const [exerciseSearchTerm, setExerciseSearchTerm] = useState('');
    const [selectedProgressionExercises, setSelectedProgressionExercises] = useState<string[]>([]);
    const [availableExercises, setAvailableExercises] = useState<string[]>([]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
            if (progressionFilterRef.current && !progressionFilterRef.current.contains(event.target as Node)) setIsProgressionFilterOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMuscleVisibility = (muscle: string) => {
        setVisibleMuscleGroups(prev => prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]);
    };

    const toggleProgressionExercise = (exercise: string) => {
        setSelectedProgressionExercises(prev => prev.includes(exercise) ? prev.filter(e => e !== exercise) : [...prev, exercise]);
    };

    const startDate = useMemo(() => {
        const now = new Date();
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        switch (timeRange) {
            case '1M': d.setMonth(now.getMonth() - 1); break;
            case '3M': d.setMonth(now.getMonth() - 3); break;
            case '6M': d.setMonth(now.getMonth() - 6); break;
            case 'YTD': d.setFullYear(now.getFullYear(), 0, 1); break;
            case 'ALL': d.setTime(0); break;
        }
        return d;
    }, [timeRange]);

    // Volume Chart
    const volumeChartData = useMemo(() => {
        const weeklyDataMap = new Map<string, any>();
        const musclesFound = new Set<string>();
        const validMuscleGroups = Object.values(MuscleGroup);

        const relevantSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(s => new Date(s.date) >= startDate);

        relevantSessions.forEach(session => {
            const monday = safeGetMonday(session.date);
            const weekKey = monday.toISOString().split('T')[0];

            if (!weeklyDataMap.has(weekKey)) {
                weeklyDataMap.set(weekKey, {
                    displayDate: monday.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
                    timestamp: monday.getTime()
                });
            }
            const weekEntry = weeklyDataMap.get(weekKey);

            if (session.details) {
                session.details.forEach((detail: any) => {
                    let metricValue = 0;
                    if (detail.setDetails && Array.isArray(detail.setDetails)) {
                        if (volumeCalculation === 'sets') {
                            metricValue = detail.setDetails.length;
                        } else {
                            metricValue = detail.setDetails.reduce((acc: number, set: any) => acc + ((parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)), 0);
                        }
                    } else {
                        metricValue = volumeCalculation === 'sets' ? detail.sets : (detail.volumeLoad || 0);
                    }

                    const exerciseDef = getExerciseByName(detail.name);

                    if (exerciseDef) {
                        const agonistsArray = Array.isArray(exerciseDef.agonists) ? exerciseDef.agonists : [];
                        const agonists = agonistsArray.length > 0 ? agonistsArray : [detail.muscleGroup];

                        agonists.forEach(raw => {
                            const m = normalizeMuscleForChart(raw);
                            if (validMuscleGroups.includes(m as MuscleGroup)) {
                                musclesFound.add(m);
                                weekEntry[m] = (weekEntry[m] || 0) + metricValue;
                            }
                        });

                        if (exerciseDef.synergists && Array.isArray(exerciseDef.synergists)) {
                            exerciseDef.synergists.forEach(raw => {
                                const m = normalizeMuscleForChart(raw);
                                if (validMuscleGroups.includes(m as MuscleGroup)) {
                                    musclesFound.add(m);
                                    weekEntry[m] = (weekEntry[m] || 0) + (metricValue * 0.5);
                                }
                            });
                        }
                    } else {
                        const m = normalizeMuscleForChart(detail.muscleGroup);
                        if (validMuscleGroups.includes(m as MuscleGroup)) {
                            musclesFound.add(m);
                            weekEntry[m] = (weekEntry[m] || 0) + metricValue;
                        }
                    }
                });
            }
        });

        const sortedMuscles = Array.from(musclesFound).sort();
        setActiveMuscleGroups(sortedMuscles);

        return Array.from(weeklyDataMap.values()).map(week => {
            sortedMuscles.forEach(m => { if (week[m] === undefined) week[m] = 0; });
            return week;
        }).sort((a, b) => a.timestamp - b.timestamp);
    }, [sessions, startDate, volumeCalculation]);

    useEffect(() => {
        if (visibleMuscleGroups.length === 0 && activeMuscleGroups.length > 0) setVisibleMuscleGroups(activeMuscleGroups);
    }, [activeMuscleGroups]);

    // Progression Chart Prep
    useEffect(() => {
        const stats: Record<string, { count: number, max: number, min: number }> = {};
        const relevantSessions = sessions.filter(s => new Date(s.date) >= startDate);

        relevantSessions.forEach(s => {
            s.details.forEach((ex: any) => {
                let sessionMax = 0;
                if (ex.setDetails) {
                    ex.setDetails.forEach((set: any) => {
                        const w = parseFloat(set.weight) || 0;
                        if (w > sessionMax) sessionMax = w;
                    });
                }

                if (sessionMax > 0) {
                    if (!stats[ex.name]) stats[ex.name] = { count: 0, max: sessionMax, min: sessionMax };
                    stats[ex.name].count += 1;
                    stats[ex.name].max = Math.max(stats[ex.name].max, sessionMax);
                    stats[ex.name].min = Math.min(stats[ex.name].min, sessionMax);
                }
            });
        });

        const exercisesList = Object.keys(stats).sort();
        setAvailableExercises(exercisesList);

        const top5 = Object.keys(stats).sort((a, b) => {
            const varA = stats[a].max - stats[a].min;
            const varB = stats[b].max - stats[b].min;
            if (varB !== varA) return varB - varA;
            return stats[b].count - stats[a].count;
        }).slice(0, 5);

        if (top5.length > 0) {
            setSelectedProgressionExercises(top5);
        } else {
            setSelectedProgressionExercises([]);
        }
    }, [sessions, startDate]);

    // Progression Chart Data
    const progressionChartData = useMemo(() => {
        const data: any[] = [];
        const weeklyMap = new Map<string, any>();

        const filtered = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).filter(s => new Date(s.date) >= startDate);

        filtered.forEach(session => {
            const sDate = new Date(session.date);
            const dateStr = sDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

            const sessionMaxes: Record<string, any> = {};

            session.details.forEach((ex: any) => {
                let maxW = 0;
                let maxReps = 0;
                if (ex.setDetails) {
                    ex.setDetails.forEach((set: any) => {
                        const w = parseFloat(set.weight) || 0;
                        if (w > maxW) {
                            maxW = w;
                            maxReps = parseFloat(set.reps) || 0;
                        }
                    });
                }
                if (maxW > 0) {
                    sessionMaxes[ex.name] = maxW;
                    sessionMaxes[`${ex.name}_reps`] = maxReps;
                }
            });

            if (timeRange === '1M') {
                if (Object.keys(sessionMaxes).length > 0) {
                    data.push({ date: dateStr, timestamp: sDate.getTime(), ...sessionMaxes });
                }
            } else {
                const monday = safeGetMonday(sDate);
                const weekKey = monday.toISOString().split('T')[0];
                if (!weeklyMap.has(weekKey)) weeklyMap.set(weekKey, { date: monday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), timestamp: monday.getTime() });
                const entry = weeklyMap.get(weekKey);
                Object.keys(sessionMaxes).forEach(key => {
                    if (key.endsWith('_reps')) return;
                    const w = sessionMaxes[key];
                    if (w > (entry[key] || 0)) {
                        entry[key] = w;
                        entry[`${key}_reps`] = sessionMaxes[`${key}_reps`];
                    }
                });
            }
        });

        if (timeRange === '1M') return data;
        return Array.from(weeklyMap.values()).sort((a, b) => a.timestamp - b.timestamp);
    }, [sessions, startDate, timeRange]);

    // Advanced Metrics
    const advancedAnalyticsData = useMemo(() => {
        return sessions
            .filter(s => new Date(s.date) >= startDate)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(session => {
                let totalSets = 0;
                let totalRir = 0;

                session.details.forEach((ex: any) => {
                    if (ex.setDetails) {
                        ex.setDetails.forEach((set: any) => {
                            const rir = parseFloat(set.rir);
                            const safeRIR = isNaN(rir) ? 0 : rir;

                            totalSets++;
                            totalRir += safeRIR;
                        });
                    } else {
                        const sets = ex.sets || 0;
                        totalSets += sets;
                        totalRir += (2 * sets);
                    }
                });

                const avgRir = totalSets > 0 ? totalRir / totalSets : 0;
                const internalLoad = Math.round(totalSets * (10 - avgRir));

                return {
                    date: new Date(session.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                    fullDate: new Date(session.date).toLocaleDateString(),
                    internalLoad: internalLoad,
                    avgRir: avgRir.toFixed(1),
                    totalSets: totalSets
                };
            });
    }, [sessions, startDate]);

    // ACWR
    const acwrData = useMemo(() => {
        const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const metrics = calculateACWRMetrics(sortedSessions);
        return metrics.filter(m => m.timestamp >= startDate.getTime());
    }, [sessions, startDate]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4">

            {/* 1. Volume Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex flex-col xl:flex-row justify-between items-center xl:items-start gap-4 mb-6">
                    <div className="text-center xl:text-left"><h3 className="text-lg font-bold text-white flex items-center justify-center xl:justify-start gap-2"><TrendingUp className="text-primary-500" size={20} /> Volume Semanal</h3><p className="text-xs text-slate-500 mt-1">Agonistas 100%, Sinergistas 50%.</p></div>
                    <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3 w-full xl:w-auto">
                        <div className="relative" ref={filterRef}><button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-300"><Layers size={14} /> Músculos {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                            {isFilterOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 p-2"><input value={muscleSearchTerm} onChange={e => setMuscleSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white mb-2" placeholder="Buscar..." /><div className="max-h-40 overflow-y-auto custom-scrollbar">{activeMuscleGroups.filter(m => m.toLowerCase().includes(muscleSearchTerm.toLowerCase())).filter(m => MUSCLE_COLORS[m]).map(m => (<button key={m} onClick={() => toggleMuscleVisibility(m)} className="w-full flex justify-between px-2 py-1 text-xs text-slate-400 hover:text-white"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: MUSCLE_COLORS[m] }}></div>{m}</div>{visibleMuscleGroups.includes(m) && <Check size={12} />}</button>))}</div><div className="border-t border-slate-800 mt-1 pt-1 flex items-center justify-between px-2"><button onClick={() => setVisibleMuscleGroups(activeMuscleGroups)} className="text-xs text-primary-400 hover:text-primary-300 py-1 font-medium">Todos</button><button onClick={() => setVisibleMuscleGroups([])} className="text-xs text-slate-400 hover:text-slate-300 py-1 font-medium">Nenhum</button></div></div>
                            )}
                        </div>
                        <div className="flex bg-slate-900 rounded-lg border border-slate-700 p-1"><button onClick={() => setVolumeCalculation('sets')} className={`px-3 py-1 text-xs font-bold rounded ${volumeCalculation === 'sets' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Séries</button><button onClick={() => setVolumeCalculation('load')} className={`px-3 py-1 text-xs font-bold rounded ${volumeCalculation === 'load' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Carga</button></div>
                        <div className="flex bg-slate-900 rounded-lg border border-slate-700 p-1">{(['1M', '3M', '6M', 'YTD', 'ALL'] as TimeRange[]).map(r => (<button key={r} onClick={() => setTimeRange(r)} className={`px-3 py-1 text-xs font-bold rounded ${timeRange === r ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>{r}</button>))}</div>
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={volumeChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={30} />
                            <YAxis stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} width={35} />
                            <RechartsTooltip
                                cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl min-w-[150px] z-50">
                                                <p className="text-[11px] font-bold text-white mb-1.5 pb-1.5 border-b border-slate-800 leading-none">{label}</p>
                                                <div className="space-y-1">
                                                    {payload.map((entry: any) => (
                                                        <div key={entry.name} className="flex items-center justify-between gap-3 text-[10px] leading-tight">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.stroke }}></div>
                                                                <span className="text-slate-300 truncate max-w-[100px]">{entry.name}</span>
                                                            </div>
                                                            <span className="font-mono font-bold text-white">{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {activeMuscleGroups.map(m => visibleMuscleGroups.includes(m) && (<Line key={m} type="monotone" dataKey={m} stroke={MUSCLE_COLORS[m]} strokeWidth={2} dot={{ r: 2 }} />))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Custom Legend for Volume Chart */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                    {activeMuscleGroups.filter(m => visibleMuscleGroups.includes(m)).map(m => (
                        <div key={m} className="flex items-center gap-1.5 min-w-max">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: MUSCLE_COLORS[m] }}></div>
                            <span className="text-[10px] text-slate-300 font-medium leading-none">{m}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Progression Chart */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6"><div><h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2"><Dumbbell className="text-amber-500" size={20} /> Progressão de Carga</h3><p className="text-xs text-slate-500 mt-1 text-center md:text-left">Evolução de carga máxima.</p></div><div className="flex gap-2 justify-center w-full md:w-auto"><div className="relative" ref={progressionFilterRef}><button onClick={() => setIsProgressionFilterOpen(!isProgressionFilterOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-300"><Filter size={14} /> Exercícios {isProgressionFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
                    {isProgressionFilterOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 p-2"><input value={exerciseSearchTerm} onChange={e => setExerciseSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-xs text-white mb-2" placeholder="Buscar..." /><div className="max-h-40 overflow-y-auto custom-scrollbar">{availableExercises.filter(e => e.toLowerCase().includes(exerciseSearchTerm.toLowerCase())).map(e => (<button key={e} onClick={() => toggleProgressionExercise(e)} className="w-full flex justify-between px-2 py-2 text-xs text-slate-400 hover:bg-slate-800 rounded"><span className={`text-left ${selectedProgressionExercises.includes(e) ? 'text-white' : ''}`}>{e}</span>{selectedProgressionExercises.includes(e) && <Check size={12} className="text-primary-500 shrink-0" />}</button>))}</div><div className="border-t border-slate-800 mt-1 pt-1 px-2"><button onClick={() => setSelectedProgressionExercises([])} className="text-[10px] text-slate-400 w-full text-center hover:text-white">Nenhum</button></div></div>
                    )}
                </div></div></div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={progressionChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={30} />
                            <YAxis stroke="#94a3b8" fontSize={10} domain={['auto', 'auto']} tick={{ fontSize: 10 }} width={35} />
                            <RechartsTooltip
                                cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl min-w-[180px] z-50">
                                                <p className="text-[11px] font-bold text-white mb-1.5 pb-1.5 border-b border-slate-800 leading-none">{label}</p>
                                                <div className="space-y-1">
                                                    {payload.map((entry: any) => (
                                                        <div key={entry.name} className="flex items-center justify-between gap-3 text-[10px] leading-tight">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.stroke }}></div>
                                                                <span className="text-slate-300 truncate max-w-[120px]">{entry.name}</span>
                                                            </div>
                                                            <span className="font-mono font-bold text-white whitespace-nowrap">
                                                                {entry.value}kg <span className="text-slate-500 font-normal">({entry.payload[`${entry.name}_reps`] || 0}r)</span>
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {selectedProgressionExercises.map((ex, i) => (<Line key={ex} type="monotone" dataKey={ex} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={3} dot={{ r: 3 }} connectNulls />))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Custom Legend for Progression Chart */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 justify-center">
                    {selectedProgressionExercises.map((ex, i) => (
                        <div key={ex} className="flex items-center gap-1.5 min-w-max">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                            <span className="text-[10px] text-slate-300 font-medium leading-none">{ex}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Systemic Load */}
            <div className="grid grid-cols-1 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2"><Battery className="text-rose-500" size={20} /> Carga Sistêmica (Fadiga)</h3>
                            <p className="text-xs text-slate-500 mt-1">Carga Interna = Total de Séries × (10 - RIR Médio).</p>
                        </div>
                        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wider items-center justify-center flex-wrap w-full md:w-auto">
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22d3ee' }}></div> Baixa</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6366f1' }}></div> Moderada</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a855f7' }}></div> Alta</div>
                            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }}></div> Extrema</div>
                        </div>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={advancedAnalyticsData} syncId="rirMetrics" margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={30} />
                                <YAxis stroke="#94a3b8" fontSize={10} label={{ value: 'Carga Interna (UA)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} tick={{ fontSize: 10 }} width={35} />
                                <RechartsTooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const zone = getInternalLoadZone(data.internalLoad);
                                            return (
                                                <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl">
                                                    <p className="text-sm font-bold text-white mb-2 pb-2 border-b border-slate-800">{label}</p>
                                                    <div className="space-y-1 text-xs">
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-slate-400">Total de Séries:</span>
                                                            <span className="text-white font-mono">{data.totalSets}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4">
                                                            <span className="text-slate-400">RIR Médio Informado:</span>
                                                            <span className="text-white font-mono">{data.avgRir}</span>
                                                        </div>
                                                        <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-slate-800">
                                                            <span className="text-slate-300 font-bold">Carga Calculada:</span>
                                                            <span className="font-mono font-bold" style={{ color: zone.color }}>{data.internalLoad} UA</span>
                                                        </div>
                                                        <div className="text-[10px] uppercase font-bold tracking-wider text-right mt-1" style={{ color: zone.color }}>
                                                            {zone.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <ReferenceLine y={80} stroke="#22d3ee" strokeDasharray="3 3" label={{ value: 'Recuperativa', fill: '#22d3ee', fontSize: 10, position: 'insideTopLeft' }} />
                                <ReferenceLine y={150} stroke="#6366f1" strokeDasharray="3 3" label={{ value: 'Alvo', fill: '#6366f1', fontSize: 10, position: 'insideTopLeft' }} />
                                <ReferenceLine y={220} stroke="#a855f7" strokeDasharray="3 3" label={{ value: 'Alta', fill: '#a855f7', fontSize: 10, position: 'insideTopLeft' }} />

                                <Bar dataKey="internalLoad" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                    {advancedAnalyticsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getInternalLoadZone(entry.internalLoad).fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. ACWR */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4 mb-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
                                <HeartPulse className="text-emerald-500" size={20} /> Controle de Carga (ACWR)
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Razão de Carga Aguda (7d) / Crônica (28d). Mantenha-se entre 0.8 e 1.3.
                            </p>
                        </div>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={acwrData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={30} />
                                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} label={{ value: 'Carga Interna (UA)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} tick={{ fontSize: 10 }} width={35} />
                                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} domain={[0, 2.5]} label={{ value: 'Ratio ACWR', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10 }} tick={{ fontSize: 10 }} width={30} />

                                <RechartsTooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            const status = getACWRStatus(data.acwr);

                                            return (
                                                <div className="bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-2xl min-w-[180px] max-w-[250px]">
                                                    <p className="text-xs font-bold text-white mb-2 pb-2 border-b border-slate-800 flex items-center gap-2">
                                                        <Calendar size={12} className="text-slate-400" /> {label}
                                                    </p>

                                                    <div className="space-y-2 text-[10px]">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-400">Carga Diária (UA)</span>
                                                            <span className="font-mono font-bold text-white bg-slate-800 px-1.5 rounded">{data.dailyLoad}</span>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2 my-2">
                                                            <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800">
                                                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Aguda (7d)</span>
                                                                <span className="font-mono text-slate-300">{data.acuteLoad}</span>
                                                            </div>
                                                            <div className="bg-slate-950/50 p-1.5 rounded border border-slate-800">
                                                                <span className="block text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Crônica (28d)</span>
                                                                <span className="font-mono text-slate-300">{data.chronicLoad}</span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-2 border-t border-slate-800">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-slate-300 font-medium">Ratio ACWR</span>
                                                                <span className="font-mono font-bold text-sm" style={{ color: status.color }}>{data.acwr}</span>
                                                            </div>
                                                            <div className="text-right text-[9px] font-bold uppercase tracking-wider" style={{ color: status.color }}>
                                                                {status.label}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {data.avgRir > 4 && (
                                                        <div className="mt-2 text-[9px] text-amber-400 font-bold bg-amber-950/30 px-2 py-1.5 rounded border border-amber-900/50 flex items-start gap-2 leading-tight">
                                                            <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                                            <span>RIR Médio {data.avgRir}: Baixa intensidade.</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                />

                                <ReferenceArea yAxisId="right" y1={0.8} y2={1.3} fillOpacity={0.1} style={{ fill: '#6366f1' }} />

                                <Bar yAxisId="left" dataKey="dailyLoad" barSize={8} radius={[2, 2, 0, 0]}>
                                    {acwrData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.acwr > 1.5 ? '#ef4444' : '#6366f1'} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="acwr" stroke="#fbbf24" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ClientAnalytics = React.memo(ClientAnalyticsInner);

export default ClientAnalytics;
