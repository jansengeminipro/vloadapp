import { useState, useMemo, useEffect } from 'react';
import { SavedSession } from '@/shared/types';
import { safeGetMonday } from '@/shared/utils/analytics';
import { TimeRange } from './useVolumeAnalysis';

export const useProgressionStats = (sessions: SavedSession[], startDate: Date, timeRange: TimeRange) => {
    const [selectedProgressionExercises, setSelectedProgressionExercises] = useState<string[]>([]);
    const [availableExercises, setAvailableExercises] = useState<string[]>([]);

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

    const progressionChartData = useMemo(() => {
        const data: any[] = [];
        const weeklyMap = new Map<string, any>();

        const filtered = [...sessions]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .filter(s => new Date(s.date) >= startDate);

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
                if (!weeklyMap.has(weekKey)) {
                    weeklyMap.set(weekKey, {
                        date: monday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                        timestamp: monday.getTime()
                    });
                }
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

    const toggleProgressionExercise = (exercise: string) => {
        setSelectedProgressionExercises(prev => prev.includes(exercise) ? prev.filter(e => e !== exercise) : [...prev, exercise]);
    };

    return {
        progressionChartData,
        selectedProgressionExercises,
        setSelectedProgressionExercises,
        availableExercises,
        toggleProgressionExercise
    };
};
