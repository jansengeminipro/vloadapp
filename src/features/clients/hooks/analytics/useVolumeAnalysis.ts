import { useState, useMemo, useEffect } from 'react';
import { SavedSession, MuscleGroup } from '@/shared/types';
import { getExerciseByName } from '@/shared/data/exercises';
import { safeGetMonday, normalizeMuscleForChart } from '@/shared/utils/analytics';
import { MUSCLE_COLORS } from '../../constants';

export type TimeRange = '1M' | '3M' | '6M' | 'YTD' | 'ALL';

export const useVolumeAnalysis = (sessions: SavedSession[], timeRange: TimeRange, volumeCalculation: 'sets' | 'load') => {
    const [visibleMuscleGroups, setVisibleMuscleGroups] = useState<string[]>([]);
    const [activeMuscleGroups, setActiveMuscleGroups] = useState<string[]>([]);

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

    const volumeChartData = useMemo(() => {
        const weeklyDataMap = new Map<string, any>();
        const musclesFound = new Set<string>();
        const validMuscleGroups = Object.values(MuscleGroup);

        const relevantSessions = [...sessions]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .filter(s => new Date(s.date) >= startDate);

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

        // Ensure ALL muscles are represented in the dataset keys, even if 0
        const sortedMuscles = Object.keys(MUSCLE_COLORS).sort();

        // We still want to know which ones have ACTUAL data for some UI logic, 
        // but for the chart, we need consistent keys.
        // Actually, let's just set activeMuscleGroups to all of them so the "All" button works as expected (shows everything).
        // Or if we want "Active" to mean "Has Data", we keep musclesFound for that.
        // But the user requested to see muscles even without data.
        return Array.from(weeklyDataMap.values()).map(week => {
            sortedMuscles.forEach(m => { if (week[m] === undefined) week[m] = 0; });
            return week;
        }).sort((a, b) => a.timestamp - b.timestamp);
    }, [sessions, startDate, volumeCalculation]);

    // Update activeMuscleGroups to include ALL muscles (for filter consistency)
    useEffect(() => {
        const allMuscles = Object.keys(MUSCLE_COLORS).sort();
        // Avoid infinite loop by checking equality roughly or just setting if length differs
        setActiveMuscleGroups(prev => {
            if (prev.length === allMuscles.length && prev.every((m, i) => m === allMuscles[i])) return prev;
            return allMuscles;
        });
    }, []);

    useEffect(() => {
        if (visibleMuscleGroups.length === 0 && activeMuscleGroups.length > 0) {
            setVisibleMuscleGroups(activeMuscleGroups);
        }
    }, [activeMuscleGroups]);

    return {
        volumeChartData,
        activeMuscleGroups,
        visibleMuscleGroups,
        setVisibleMuscleGroups,
        startDate // Also returning startDate as it is needed for other hooks
    };
};
