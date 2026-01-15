import { useMemo } from 'react';
import { Client, SavedSession, WorkoutTemplate } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';
import { normalizeMuscleForChart } from '@/shared/utils/analytics';

interface PerformanceScoreHookProps {
    dashboardStats: any;
    analyticsMetrics: any;
    latestAssessment?: Assessment;
    client: Client | null;
    completedSessions: SavedSession[];
    activeProgramWorkouts?: WorkoutTemplate[];
}

export const usePerformanceScore = ({
    dashboardStats,
    analyticsMetrics,
    client,
    completedSessions,
    activeProgramWorkouts
}: PerformanceScoreHookProps) => {
    return useMemo(() => {
        // Now 5 Axes: Consistency, Vol MMSS, Vol MMII, Evolution, Intensity
        const scores = [
            { subject: 'Consistência', A: 0, fullMark: 100 },
            { subject: 'Vol. MMSS', A: 0, fullMark: 100 },
            { subject: 'Vol. MMII', A: 0, fullMark: 100 },
            { subject: 'Evolução', A: 0, fullMark: 100 },
            { subject: 'Intensidade', A: 0, fullMark: 100 },
        ];

        if (!dashboardStats) return scores;

        // 1. CONSISTENCY (Consistência)
        const plannedSessions = Number(dashboardStats.plannedWeeklySessions) || 1;
        const currentSessions = Number(dashboardStats.weekSessionsCount) || 0;
        let consistencyScore = (currentSessions / plannedSessions) * 100;
        if (isNaN(consistencyScore)) consistencyScore = 0;
        if (consistencyScore > 100) consistencyScore = 100;
        scores[0].A = Math.round(consistencyScore);


        // 2 & 3. VOLUME SPLIT (MMSS vs MMII)
        // Calculate Planned Sets for Upper vs Lower
        const upperMuscles = ['Peitoral', 'Costas', 'Ombros', 'Tríceps', 'Bíceps', 'Trapézio', 'Antebraço'];
        const lowerMuscles = ['Quadríceps', 'Posteriores', 'Glúteos', 'Panturrilhas', 'Adutores', 'Abdutores'];

        let plannedUpperSets = 0;
        let plannedLowerSets = 0;

        if (activeProgramWorkouts && Array.isArray(activeProgramWorkouts) && client?.activeProgram?.schedule) {
            const schedule = client.activeProgram.schedule;
            activeProgramWorkouts.forEach(t => {
                if (!t || !t.id) return;
                const frequency = (schedule[t.id] || []).length || 0; // Days per week
                if (frequency > 0 && t.exercises && Array.isArray(t.exercises)) {
                    t.exercises.forEach(ex => {
                        if (!ex || !ex.muscleGroup) return;
                        const m = normalizeMuscleForChart(ex.muscleGroup as string) || ex.muscleGroup as string;

                        if (upperMuscles.includes(m)) plannedUpperSets += ((ex.sets || 0) * frequency);
                        else if (lowerMuscles.includes(m)) plannedLowerSets += ((ex.sets || 0) * frequency);
                    });
                }
            });
        }

        // Calculate Actual Sets from dashboardStats.weeklyMuscleVolume
        const actualVolumes = dashboardStats.weeklyMuscleVolume || {};
        let actualUpperSets = 0;
        let actualLowerSets = 0;

        Object.keys(actualVolumes).forEach(m => {
            if (upperMuscles.includes(m)) actualUpperSets += actualVolumes[m];
            if (lowerMuscles.includes(m)) actualLowerSets += actualVolumes[m];
        });

        // Score 2: Upper Body Adherence
        let scoreMMSS = 0;
        if (plannedUpperSets > 0) {
            scoreMMSS = (actualUpperSets / plannedUpperSets) * 100;
            if (scoreMMSS > 110) scoreMMSS = 110;
            if (scoreMMSS > 100) scoreMMSS = 100;
        } else if (actualUpperSets > 0) {
            scoreMMSS = 100;
        }
        if (isNaN(scoreMMSS)) scoreMMSS = 0;
        scores[1].A = Math.round(scoreMMSS);

        // Score 3: Lower Body Adherence
        let scoreMMII = 0;
        if (plannedLowerSets > 0) {
            scoreMMII = (actualLowerSets / plannedLowerSets) * 100;
            if (scoreMMII > 100) scoreMMII = 100;
        } else if (actualLowerSets > 0) {
            scoreMMII = 100;
        }
        if (isNaN(scoreMMII)) scoreMMII = 0;
        scores[2].A = Math.round(scoreMMII);


        // 4. PROGRESS (Evolução / Taxa de Progresso)
        // Check completedSessions
        if (!completedSessions || !Array.isArray(completedSessions)) {
            // Early return or just continue with 0
        }

        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);

        // Safe filters
        const sessions = Array.isArray(completedSessions) ? completedSessions : [];
        const thisWeekSessions = sessions.filter(s => new Date(s.date) >= startOfWeek);
        const olderSessions = sessions.filter(s => new Date(s.date) < startOfWeek);

        let progressScore = 0;
        let comparisonsCount = 0;
        let successCount = 0;

        // Map older sessions
        const historyMap: Record<string, number> = {};

        olderSessions.forEach(s => {
            if (s.details && Array.isArray(s.details)) {
                s.details.forEach((d: any) => {
                    const name = d.name;
                    let bestE1RM = 0;
                    if (d.setDetails && Array.isArray(d.setDetails)) {
                        bestE1RM = d.setDetails.reduce((max: number, set: any) => {
                            const w = parseFloat(set.weight) || 0;
                            const r = parseFloat(set.reps) || 0;
                            const e1rm = w * (1 + 0.0333 * r);
                            return Math.max(max, e1rm);
                        }, 0);
                    }
                    if (!historyMap[name]) historyMap[name] = bestE1RM;
                });
            }
        });

        thisWeekSessions.forEach(s => {
            if (s.details && Array.isArray(s.details)) {
                s.details.forEach((d: any) => {
                    if (historyMap[d.name]) {
                        let currentBest = 0;
                        if (d.setDetails && Array.isArray(d.setDetails)) {
                            currentBest = d.setDetails.reduce((max: number, set: any) => {
                                const w = parseFloat(set.weight) || 0;
                                const r = parseFloat(set.reps) || 0;
                                return Math.max(max, w * (1 + 0.0333 * r));
                            }, 0);
                        }
                        if (currentBest > 0) {
                            comparisonsCount++;
                            if (currentBest > historyMap[d.name]) successCount++;
                        }
                    }
                });
            }
        });

        if (comparisonsCount < 3) {
            // FALLBACK
            const thisWeekVol = thisWeekSessions.reduce((acc, s) => acc + (s.volumeLoad || 0), 0);

            const startOfPrevWeek = new Date(startOfWeek);
            startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
            const prevWeekSessions = olderSessions.filter(s => {
                const d = new Date(s.date);
                return d >= startOfPrevWeek && d < startOfWeek;
            });
            const prevWeekVol = prevWeekSessions.reduce((acc, s) => acc + (s.volumeLoad || 0), 0);

            if (thisWeekVol > prevWeekVol && prevWeekVol > 0) progressScore = 100;
            else if (thisWeekVol === 0 && prevWeekVol === 0) progressScore = 0;
            else if (thisWeekVol >= prevWeekVol * 0.9) progressScore = 75;
            else progressScore = 40;

        } else {
            const ratio = successCount / comparisonsCount;
            if (ratio >= 0.6) progressScore = 100;
            else if (ratio >= 0.3) progressScore = 75;
            else progressScore = 40;
        }

        if (isNaN(progressScore)) progressScore = 0;
        scores[3].A = Math.round(progressScore);


        // 5. INTENSITY (Esforço / RPE)
        let totalRPE = 0;
        let setCounts = 0;

        thisWeekSessions.forEach(s => {
            if (s.details && Array.isArray(s.details)) {
                s.details.forEach((d: any) => {
                    if (d.setDetails && Array.isArray(d.setDetails)) {
                        d.setDetails.forEach((set: any) => {
                            let val = 0;
                            if (set.rpe !== undefined) val = parseFloat(set.rpe);
                            else if (set.rir !== undefined) val = 10 - parseFloat(set.rir);

                            if (val > 0) {
                                totalRPE += val;
                                setCounts++;
                            }
                        });
                    }
                });
            }
        });

        let avgRPE = 0;
        if (setCounts > 0) avgRPE = totalRPE / setCounts;
        else {
            const sessionRPEs = thisWeekSessions.map(s => s.rpe).filter(r => r !== undefined && r > 0) as number[];
            if (sessionRPEs.length) {
                avgRPE = sessionRPEs.reduce((a, b) => a + b, 0) / sessionRPEs.length;
            }
        }

        let effortScore = 0;
        if (avgRPE > 0) {
            if (avgRPE >= 8.0 && avgRPE <= 9.5) effortScore = 100;
            else if (avgRPE >= 7.0 && avgRPE < 8.0) effortScore = 85;
            else if (avgRPE > 9.5) effortScore = 70;
            else if (avgRPE < 6.0) effortScore = 40;
            else effortScore = 60;
        } else {
            effortScore = 0;
        }

        if (isNaN(effortScore)) effortScore = 0;
        scores[4].A = Math.round(effortScore);

        return scores;

    }, [dashboardStats, analyticsMetrics, client, completedSessions, activeProgramWorkouts]);
};
