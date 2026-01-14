import { useState, useMemo } from 'react';
import { Client, SavedSession, WorkoutTemplate } from '@/shared/types';
import { safeGetMonday, normalizeMuscleForChart } from '@/shared/utils/analytics';
import { getExerciseByName } from '@/shared/data/exercises';

export const useClientDashboardStats = (
    client: Client | null,
    sessions: SavedSession[],
    allTemplates: WorkoutTemplate[]
) => {
    const [progDistributionMetric, setProgDistributionMetric] = useState<'sets' | 'load'>('sets');

    const completedSessions = useMemo(() => {
        return sessions.filter(s => s.status === 'completed');
    }, [sessions]);

    const activeProgramWorkouts = useMemo(() => {
        if (!client?.activeProgram) return [];
        return allTemplates.filter(t => client.activeProgram!.workoutIds.includes(t.id));
    }, [client?.activeProgram, allTemplates]);

    const dashboardStats = useMemo(() => {
        if (!client?.activeProgram) return null;

        const now = new Date();
        const currentWeekStart = safeGetMonday(now);
        const nextWeekStart = new Date(currentWeekStart);
        nextWeekStart.setDate(nextWeekStart.getDate() + 7);

        const lastWeekStart = new Date(currentWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(currentWeekStart);

        const mesoStart = new Date(client.activeProgram.startDate);
        const mesoEnd = client.activeProgram.endDate ? new Date(client.activeProgram.endDate) : now;

        const processedSessions = completedSessions.map(s => ({
            ...s,
            dateObj: new Date(s.date)
        }));

        const weekSessions = processedSessions.filter(s => s.dateObj >= currentWeekStart && s.dateObj < nextWeekStart);
        const lastWeekSessions = processedSessions.filter(s => s.dateObj >= lastWeekStart && s.dateObj < lastWeekEnd);
        const mesoSessions = processedSessions.filter(s => s.dateObj >= mesoStart && s.dateObj <= mesoEnd);

        const schedule: Record<string, number[]> = client.activeProgram?.schedule || {};
        const plannedWeeklySessions = Object.values(schedule).reduce((acc: number, days: any) => acc + (Array.isArray(days) ? days.length : 0), 0) || activeProgramWorkouts.length;

        const weeksCount = Math.max(1, Math.ceil(Math.abs(mesoEnd.getTime() - mesoStart.getTime()) / (1000 * 60 * 60 * 24 * 7)));
        const plannedMesocycleSessions = plannedWeeklySessions * weeksCount;

        const plannedWeeklySets = activeProgramWorkouts.reduce((acc, t) => {
            const daysCount = (schedule[t.id] || []).length || 1;
            const setsInWorkout = t.exercises.reduce((exAcc, ex) => exAcc + ex.sets, 0);
            return acc + (setsInWorkout * daysCount);
        }, 0);

        const currentWeeklySets = weekSessions.reduce((acc, s) => acc + s.totalSets, 0);

        // Muscle Volume Distribution
        const weeklyMuscleVolume: Record<string, number> = {};
        const distMap: Record<string, number> = {};
        const prevDistMap: Record<string, number> = {};

        const processSessionForDist = (sessions: any[], targetMap: Record<string, number>, volumeMap?: Record<string, number>) => {
            sessions.forEach(s => {
                s.details.forEach((d: any) => {
                    const sets = d.sets || 0;
                    let distValue = 0;
                    if (progDistributionMetric === 'sets') {
                        distValue = sets;
                    } else {
                        distValue = d.setDetails && Array.isArray(d.setDetails)
                            ? d.setDetails.reduce((acc: number, set: any) => acc + ((parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)), 0)
                            : (d.volumeLoad || 0);
                    }

                    const exerciseDef = getExerciseByName(d.name);
                    if (exerciseDef) {
                        const agonists = exerciseDef.agonists?.length > 0 ? exerciseDef.agonists : [d.muscleGroup];
                        agonists.forEach(raw => {
                            const m = normalizeMuscleForChart(raw);
                            if (m) {
                                if (volumeMap) volumeMap[m] = (volumeMap[m] || 0) + sets;
                                targetMap[m] = (targetMap[m] || 0) + distValue;
                            }
                        });
                        if (exerciseDef.synergists) {
                            exerciseDef.synergists.forEach(raw => {
                                const m = normalizeMuscleForChart(raw);
                                if (m) {
                                    if (volumeMap) volumeMap[m] = (volumeMap[m] || 0) + (sets * 0.5);
                                    targetMap[m] = (targetMap[m] || 0) + (distValue * 0.5);
                                }
                            });
                        }
                    } else if (d.muscleGroup) {
                        const m = normalizeMuscleForChart(d.muscleGroup);
                        if (m) {
                            if (volumeMap) volumeMap[m] = (volumeMap[m] || 0) + sets;
                            targetMap[m] = (targetMap[m] || 0) + distValue;
                        }
                    }
                });
            });
        };

        processSessionForDist(weekSessions, distMap, weeklyMuscleVolume);
        processSessionForDist(lastWeekSessions, prevDistMap);

        const muscleDistributionData = Object.keys(distMap).map(m => ({
            name: m,
            value: distMap[m],
            prevValue: prevDistMap[m] || 0
        })).sort((a, b) => b.value - a.value);

        return {
            weekSessionsCount: weekSessions.length,
            mesocycleSessionsCount: mesoSessions.length,
            plannedWeeklySessions,
            plannedMesocycleSessions,
            currentWeeklySets,
            plannedWeeklySets,
            weeklyMuscleVolume,
            muscleDistributionData
        };
    }, [completedSessions, activeProgramWorkouts, client, progDistributionMetric]);

    return {
        dashboardStats,
        progDistributionMetric,
        setProgDistributionMetric,
        completedSessions,
        activeProgramWorkouts
    };
};
