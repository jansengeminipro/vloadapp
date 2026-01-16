import { useMemo } from 'react';
import { Client, SavedSession, WorkoutTemplate } from '@/shared/types';
import { Assessment } from '@/features/assessments/domain/models';
import { normalizeMuscleForChart } from '@/shared/utils/analytics';
import { useProgressionAnalysis } from './useProgressionAnalysis';

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

    // Call the progression hook at the top level
    const { stats: progressionStats } = useProgressionAnalysis(completedSessions || []);

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
        // Now fully delegated to the hook!
        scores[3].A = Math.round(progressionStats.progressScore || 0);


        // 5. INTENSITY (Esforço / RPE)
        let totalRPE = 0;
        let setCounts = 0;
        const sessions = completedSessions || [];

        // Filter this week sessions manually here since we need them for Intensity too
        // (Or we could extract Intensity logic too, but let's keep it here for now as requested)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 7);
        const thisWeekSessions = sessions.filter(s => new Date(s.date) >= startOfWeek);

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

    }, [dashboardStats, analyticsMetrics, client, completedSessions, activeProgramWorkouts, progressionStats]);
};
